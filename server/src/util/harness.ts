import type { Lang } from "../courses/types";

/**
 * Builds the full source file that runs for a batch of test cases. Every driver
 * reads a JSON object { "tests": [ { "args": [...] }, ... ] } from stdin, runs
 * solve(...args) for each test, and prints ONE compact-JSON result per line on
 * stdout (line i == result for test i). Each line is raw JSON text, so big
 * integers stay exact (compared as strings by the judge).
 *
 * A per-test exception prints a line of the form {"__tru_error__":"..."} so the
 * judge can show the actual runtime error for that test.
 *
 * Batching all tests into one execution means a single container (and one
 * javac compile for Java) serves an entire submit, instead of one container per
 * test case.
 *
 * Python and JavaScript use their built-in JSON. Java uses Gson (bundled at
 * /opt/gson.jar) plus reflection so the driver is generic across any solve(...)
 * signature.
 */

const PYTHON_DRIVER = `
import json
import sys

def __tru_run():
    _data = json.load(sys.stdin)
    for _t in _data["tests"]:
        try:
            _out = solve(*_t["args"])
            print(json.dumps(_out, separators=(",", ":")))
        except Exception as _e:
            print(json.dumps({"__tru_error__": repr(_e)}, separators=(",", ":")))

if __name__ == "__main__":
    __tru_run()
`;

const JAVASCRIPT_DRIVER = `
const fs = require('fs');
const __data = JSON.parse(fs.readFileSync(0, 'utf8'));
for (const __t of __data.tests) {
  try {
    process.stdout.write(JSON.stringify(solve(...__t.args)) + "\\n");
  } catch (__e) {
    process.stdout.write(JSON.stringify({ __tru_error__: String(__e && __e.stack || __e) }) + "\\n");
  }
}
`;

const JAVA_DRIVER = `
import com.google.gson.*;
import java.lang.reflect.*;
import java.nio.charset.StandardCharsets;
import java.util.*;

public class Main {

    // <USER CODE>

    public static void main(String[] args) throws Exception {
        String input = new String(System.in.readAllBytes(), StandardCharsets.UTF_8);
        JsonObject root = JsonParser.parseString(input).getAsJsonObject();
        JsonArray all = root.getAsJsonArray("tests");

        Method target = null;
        if (all.size() > 0) {
            int arity = all.get(0).getAsJsonObject().getAsJsonArray("args").size();
            for (Method m : Main.class.getDeclaredMethods()) {
                if (Modifier.isStatic(m.getModifiers())
                    && m.getName().equals("solve")
                    && m.getParameterCount() == arity) {
                    target = m;
                    break;
                }
            }
            if (target == null) {
                throw new RuntimeException(
                    "No static solve method with " + arity + " parameter(s) found.");
            }
        }

        for (int k = 0; k < all.size(); k++) {
            JsonArray rawArgs = all.get(k).getAsJsonObject().getAsJsonArray("args");
            try {
                Object[] callArgs = new Object[rawArgs.size()];
                for (int i = 0; i < rawArgs.size(); i++) {
                    callArgs[i] = toJava(rawArgs.get(i), target.getParameterTypes()[i]);
                }
                Object result = target.invoke(null, callArgs);
                System.out.println(new Gson().toJson(result));
            } catch (Exception ex) {
                Throwable cause = ex.getCause() != null ? ex.getCause() : ex;
                JsonObject e = new JsonObject();
                e.addProperty("__tru_error__", String.valueOf(cause));
                System.out.println(new Gson().toJson(e));
            }
        }
    }

    static Object toJava(JsonElement el, Class<?> t) {
        if (t == int.class || t == Integer.class) return el.getAsInt();
        if (t == long.class || t == Long.class) return el.getAsLong();
        if (t == double.class || t == Double.class) return el.getAsDouble();
        if (t == boolean.class || t == Boolean.class) return el.getAsBoolean();
        if (t == String.class) return el.getAsString();
        if (t == int[].class) {
            JsonArray a = el.getAsJsonArray();
            int[] r = new int[a.size()];
            for (int i = 0; i < a.size(); i++) r[i] = a.get(i).getAsInt();
            return r;
        }
        if (t == long[].class) {
            JsonArray a = el.getAsJsonArray();
            long[] r = new long[a.size()];
            for (int i = 0; i < a.size(); i++) r[i] = a.get(i).getAsLong();
            return r;
        }
        if (t == String[].class) {
            JsonArray a = el.getAsJsonArray();
            String[] r = new String[a.size()];
            for (int i = 0; i < a.size(); i++) r[i] = a.get(i).getAsString();
            return r;
        }
        throw new RuntimeException("Unsupported parameter type: " + t.getName());
    }
}
`;

const CPP_DRIVER = `#include <nlohmann/json.hpp>
#include <iostream>
#include <string>
#include <type_traits>
#include <utility>
#include <vector>

using nlohmann::json;

// <USER CODE>

// ---- trucoder driver ----
// __TruArg converts a JSON arg to the exact parameter type the user declared:
// the conversion operator is instantiated with T = the parameter type at the
// call site, so solve(...) works with any signature (int/long long/double/
// bool/std::string/std::vector<T>) without per-lesson codegen.
struct __TruArg {
  const json& j;
  template <typename T>
  operator T() const { return j.get<T>(); }
};

// Factory (not braced-init) so the call also works in unevaluated contexts
// (decltype in the SFINAE probe below).
__TruArg __tru_arg(const json& j) { return __TruArg{j}; }

template <std::size_t... I>
auto __tru_make_impl(const json& args, std::index_sequence<I...>)
    -> decltype(solve(__tru_arg(args[I])...)) {
  return solve(__tru_arg(args[I])...);
}

template <std::size_t N>
auto __tru_make(const json& args)
    -> decltype(__tru_make_impl(args, std::make_index_sequence<N>{})) {
  return __tru_make_impl(args, std::make_index_sequence<N>{});
}

// SFINAE probe: is solve callable with exactly N args?
template <std::size_t N, typename = void>
struct __tru_can : std::false_type {};
template <std::size_t N>
struct __tru_can<N, std::void_t<decltype(__tru_make<N>(std::declval<const json&>()))>>
    : std::true_type {};

static void __tru_append(const json& v, std::string& out) {
  if (v.is_array()) {
    out += '[';
    bool first = true;
    for (const auto& e : v) {
      if (!first) out += ',';
      first = false;
      __tru_append(e, out);
    }
    out += ']';
  } else if (v.is_string()) {
    out += json(v.get<std::string>()).dump();
  } else if (v.is_boolean()) {
    out += v.get<bool>() ? "true" : "false";
  } else if (v.is_number_integer() || v.is_number_unsigned()) {
    out += std::to_string(v.get<long long>());
  } else if (v.is_number_float()) {
    out += json(v.get<double>()).dump();
  } else {
    out += v.dump(-1, ' ', true);
  }
}

static void __tru_print(const json& v) {
  std::string out;
  __tru_append(v, out);
  std::cout << out << "\\n";
}

template <std::size_t N>
void __tru_dispatch(const json& args) {
  // Only the arity that matches solve's signature is instantiated — the
  // wrong-arity branches are discarded by if constexpr, so a 1-arg solve
  // does not fail to compile on the 6-arg case.
  if constexpr (__tru_can<N>::value) {
    __tru_print(json(__tru_make<N>(args)));
  }
}

static void __tru_run(const json& t) {
  const auto& args = t["args"];
  switch (args.size()) {
    case 0: __tru_dispatch<0>(args); break;
    case 1: __tru_dispatch<1>(args); break;
    case 2: __tru_dispatch<2>(args); break;
    case 3: __tru_dispatch<3>(args); break;
    case 4: __tru_dispatch<4>(args); break;
    case 5: __tru_dispatch<5>(args); break;
    case 6: __tru_dispatch<6>(args); break;
    default: throw std::runtime_error("too many arguments (max 6)");
  }
}

int main() {
  json data;
  std::cin >> data;
  for (const auto& t : data["tests"]) {
    try {
      __tru_run(t);
    } catch (const std::exception& e) {
      std::cout << json{{"__tru_error__", std::string(e.what())}}.dump(-1, ' ', true) << "\\n";
    } catch (...) {
      std::cout << json{{"__tru_error__", "unknown error"}}.dump(-1, ' ', true) << "\\n";
    }
  }
}
`;

export function buildHarness(language: Lang, userCode: string): string {
  switch (language) {
    case "python":
      return `${userCode.trim()}\n${PYTHON_DRIVER}`;
    case "javascript":
      return `${userCode.trim()}\n${JAVASCRIPT_DRIVER}`;
    case "java":
      return JAVA_DRIVER.replace("    // <USER CODE>", userCode.trim());
    case "cpp":
      return CPP_DRIVER.replace("// <USER CODE>", userCode.trim());
  }
}

export function harnessFileName(language: Lang): string {
  switch (language) {
    case "python":
      return "main.py";
    case "javascript":
      return "main.js";
    case "java":
      return "Main.java";
    case "cpp":
      return "main.cpp";
  }
}
