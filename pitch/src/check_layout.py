import glob
import json


def iter_text_elements(data):
    for element in data.get("elements", []):
        if element.get("text"):
            yield element


def main():
    problems = []
    text_count = 0

    for path in sorted(glob.glob("pitch/output/slide-*.layout.json")):
        with open(path, encoding="utf-8") as handle:
            data = json.load(handle)

        for element in iter_text_elements(data):
            text_count += 1
            bbox = element.get("bbox") or [0, 0, 0, 0]
            layout = element.get("textLayout") or {}
            height = layout.get("height")
            max_width = max((line.get("width", 0) for line in layout.get("lines", [])), default=0)

            if height and height > bbox[3] + 1:
                problems.append((path, element.get("name"), "height", height, bbox[3]))
            if max_width and max_width > bbox[2] + 1:
                problems.append((path, element.get("name"), "width", max_width, bbox[2]))

    print(f"text_count={text_count}")
    print(f"problem_count={len(problems)}")
    for problem in problems[:30]:
        print(problem)


if __name__ == "__main__":
    main()
