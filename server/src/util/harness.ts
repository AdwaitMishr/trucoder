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

export function buildHarness(language: Lang, userCode: string): string {
  switch (language) {
    case "python":
      return `${userCode.trim()}\n${PYTHON_DRIVER}`;
    case "javascript":
      return `${userCode.trim()}\n${JAVASCRIPT_DRIVER}`;
    case "java":
      return JAVA_DRIVER.replace("    // <USER CODE>", userCode.trim());
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
  }
}
