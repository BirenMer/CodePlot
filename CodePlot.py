import os
import ast
import math
import colorsys
import json
import webbrowser
from pyvis.network import Network


class CodePlot:
    def __init__(self):
        self.file_data = {}     # {file_path: {func_name: {"args": [...], "calls": [...]}}}
        self.func_to_file = {}  # {func_name: file_path}

    def process_file(self, file_path):
        """Parse a Python file to extract function definitions and their calls."""
        with open(file_path, 'r') as file:
            code = file.read()
        tree = ast.parse(code)
        functions = {}
        for node in ast.walk(tree):
            if isinstance(node, ast.FunctionDef):
                func_name = node.name
                args = [arg.arg for arg in node.args.args]
                calls = self.extract_function_calls(node)
                functions[func_name] = {"args": args, "calls": calls}
                self.func_to_file[func_name] = file_path
        self.file_data[file_path] = functions

    def extract_function_calls(self, func_node):
        """Extract function call names from the AST of a function."""
        calls = []
        for node in ast.walk(func_node):
            if isinstance(node, ast.Call) and isinstance(node.func, ast.Name):
                calls.append(node.func.id)
        return calls
    def process_directory(self, directory):
        """Recursively process all Python files in a directory, ignoring specific folders."""
        ignored_folders = {"venv", "node_modules","cogpy","python","_internal",""}  # Ignore common environment directories
        for root, dirs, files in os.walk(directory):
            dirs[:] = [d for d in dirs if d not in ignored_folders]  # Modify dirs in-place to skip ignored folders
            for file in files:
                if file.endswith(".py"):
                    self.process_file(os.path.join(root, file))

    def is_dark_color(self, hex_color):
        """
        Return True if the color is considered "dark" based on its luminance.
        """
        hex_color = hex_color.lstrip("#")
        r, g, b = (int(hex_color[i:i+2], 16) for i in (0, 2, 4))
        luminance = 0.2126 * r + 0.7152 * g + 0.0722 * b
        return luminance > 128

    def generate_file_colors(self, n):
        """
        Generate n distinct slightly darker pastel colors using HLS color space.
        """
        colors = []
        for i in range(n):
            hue = i / n
            lightness = 0.65  # Reduced from 0.8 to make colors darker
            saturation = 0.6  # Slightly increased saturation for better distinction
            r, g, b = colorsys.hls_to_rgb(hue, lightness, saturation)
            hex_color = "#{:02x}{:02x}{:02x}".format(
                int(r * 255), int(g * 255), int(b * 255)
            )
            colors.append(hex_color)
        return colors

    def plot_combined_graph(self, output_file="combined_code_flow.html"):
        # Create the network filling the entire browser viewport.
        net = Network(height="100vh", width="100vw", directed=True)

        node_ids = {}
        # Sort the file paths so that the mapping order is predictable.
        file_paths = sorted(list(self.file_data.keys()))
        n_files = len(file_paths)
        grid_size = math.ceil(math.sqrt(n_files))
        cluster_spacing = 1200  # Spacing between file clusters

        file_positions = {}
        file_colors = self.generate_file_colors(n_files)
        file_color_map = {}

        # Map each file to a position and a color.
        for index, fpath in enumerate(file_paths):
            row = index // grid_size
            col = index % grid_size
            center_x = col * cluster_spacing
            center_y = row * cluster_spacing
            file_positions[fpath] = (center_x, center_y)
            file_color_map[fpath] = file_colors[index]

        # Build groups options from file_color_map (using file base name as group name).
        groups_options = {}
        for fpath, color in file_color_map.items():
            file_name = os.path.basename(fpath)
            groups_options[file_name] = {
                "color": {
                    "background": color,
                    "border": color,
                    "highlight": {
                        "background": color,
                        "border": color
                    }
                },
                "font": {
                    "color": "white" if self.is_dark_color(color) else "black"
                }
            }

        # Update network options to include groups.
        net.set_options(json.dumps({
            "groups": groups_options,
            "nodes": {
                "font": {"size": 14},
                "shapeProperties": {"borderRadius": 0},
                "widthConstraint": {"maximum": 150}
            },
            "edges": {
                "smooth": {"type": "continuous"}
            },
            "physics": {"enabled": False}
        }))

        # Create function nodes in a circular layout for each file.
        for fpath, functions in self.file_data.items():
            file_label = os.path.basename(fpath)
            center_x, center_y = file_positions[fpath]
            func_list = list(functions.keys())
            n_funcs = len(func_list)
            radius = 200 + 10 * n_funcs  # Increase radius for more spacing

            for i, func_name in enumerate(func_list):
                angle = (2 * math.pi * i) / max(1, n_funcs)
                offset_x = radius * math.cos(angle)
                offset_y = radius * math.sin(angle)
                node_x = center_x + offset_x
                node_y = center_y + offset_y

                node_id = f"{file_label}::{func_name}"
                node_ids[(fpath, func_name)] = node_id

                details = functions[func_name]
                arg_str = ", ".join(details['args']) if details['args'] else "No Arguments"
                title = f"Function: {func_name}<br>Arguments: {arg_str}"

                # When adding the node, we still assign the group to ensure proper grouping.
                net.add_node(
                    node_id,
                    label=func_name,
                    title=title,
                    shape="box",
                    group=file_label,
                    x=node_x,
                    y=node_y,
                    fixed={"x": True, "y": True}
                )

        # Create edges for intra-file and cross-file calls.
        for fpath, functions in self.file_data.items():
            for func_name, details in functions.items():
                src_id = node_ids[(fpath, func_name)]
                for called_func in details["calls"]:
                    if called_func in self.func_to_file:
                        target_file = self.func_to_file[called_func]
                        if (target_file, called_func) in node_ids:
                            dst_id = node_ids[(target_file, called_func)]
                            is_cross_file = (target_file != fpath)
                            edge_color = "#444444" if is_cross_file else "#666666"
                            net.add_edge(
                                src_id,
                                dst_id,
                                color=edge_color,
                                width=2,
                                dashes=is_cross_file,
                                title=f"{os.path.basename(fpath)}::{func_name} -> {os.path.basename(target_file)}::{called_func}"
                            )

        # ------------------------------------------------
        # INJECT A DYNAMIC LEGEND WITH DROPDOWN (using HTML5 details/summary)
        # ------------------------------------------------
        legend_table = """
        <div id="legend" style="
                position: absolute; top: 10px; right: 10px; 
                background-color: rgba(255,255,255,0.95); padding: 10px; 
                border: 1px solid #000; z-index: 1000; font-family: Arial, sans-serif;
                font-size: 14px; max-width: 1000px; /* Limit legend width */
                white-space: normal; 
                overflow-wrap: break-word; 
                word-wrap: break-word;">
        <h4 style="margin-top:0;">Files</h4>
        """
        # For each file, add a details element with a summary that toggles a list of function names.
        for fpath, color in file_color_map.items():
            file_name = os.path.basename(fpath)
            func_names = list(self.file_data.get(fpath, {}).keys())
            legend_table += f"""
            <details style="margin-bottom:8px;">
                <summary style="cursor:pointer; display: flex; align-items: center;">
                    <span style="display:inline-block; width:12px; height:12px; background-color:{color}; margin-right:8px;"></span>
                    <span>{file_name}</span>
                </summary>
                <ul style="list-style:none; margin:4px 0 0 20px; padding:0;">
            """
            if func_names:
                for fname in func_names:
                    legend_table += f"""
                    <li style="margin:2px 0; display: flex; align-items: center;">
                        <span style="display:inline-block; width:8px; height:8px; background-color:{color}; margin-right:5px;"></span>
                        <span>{fname}</span>
                    </li>
                    """
            else:
                legend_table += "<li>No Functions</li>"
            legend_table += """
                </ul>
            </details>
            """
        # Add a separate section for edge types.
        legend_table += """
            <h4 style="margin:10px 0 4px 0;">Edge Types</h4>
            <div style="display: flex; align-items: center; margin-bottom:4px;">
                <div style="width:30px; height:5px; background-color:#666666; margin-right:8px;"></div>
                <span>Intra-File Call</span>
            </div>
            <div style="display: flex; align-items: center;">
                <div style="width:30px; height:5px; border-bottom:2px dashed #444444; margin-right:8px;"></div>
                <span>Cross-File Call</span>
            </div>
        </div>
        """

        # Inject the legend into the generated HTML.
        html_content = net.generate_html(notebook=False)
        html_content = html_content.replace("<body>", "<body>" + legend_table)
        with open(output_file, "w") as f:
            f.write(html_content)
        webbrowser.open("file://" + os.path.realpath(output_file))


if __name__ == "__main__":
    visualizer = CodePlot()
    directory_path = "path_to_your_project_dir"
    visualizer.process_directory(directory_path)
    visualizer.plot_combined_graph("CodePlot.html")
