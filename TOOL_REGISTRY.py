def get_tool_prompt():
    tools = [
        {
            "tool_name": "Single Imagery Tool",
            "tool_description": (
                "Handles single-image tasks such as VQA, captioning, "
                "grounding, general interpretation and specialist "
                "multispectral analysis."
            ),
            "parameters_to_pass": [
                "query",
                "image"
            ]
        },
        {
            "tool_name": "Bi-Temporal Tool",
            "tool_description": (
                "Handles analysis of two temporal remote-sensing images "
                "for change detection, characterization and explanation."
            ),
            "parameters_to_pass": [
                "query",
                "image_t1",
                "image_t2"
            ]
        },
        {
            "tool_name": "Cross-Modal Tool",
            "tool_description": (
                "Handles optical and SAR analysis, including "
                "cross-modal interpretation and fusion."
            ),
            "parameters_to_pass": [
                "query",
                "optical_image",
                "sar_image"
            ]
        }
    ]

    prompt = "Available tools:\n\n"

    for i, tool in enumerate(tools, start=1):
        prompt += f"tool_{i} {{\n"
        prompt += f"    tool_name: {tool['tool_name']}\n"
        prompt += f"    tool_description: {tool['tool_description']}\n"
        prompt += f"    parameters_to_pass: {tool['parameters_to_pass']}\n"
        prompt += "}}\n\n"

    return prompt