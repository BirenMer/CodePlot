let nodes = [];
let links = [];
let simulation;
let svg, g;
let zoom;
let selectedNodes = new Set();

/**
 * Show or hide the central “Analyzing code structure...” overlay.
 * @param {boolean} show – true to display the spinner, false to hide it.
 */
function showLoading(show) {
    const el = document.getElementById('loading');
    if (!el) return;
    el.style.display = show ? 'block' : 'none';
}
// Generate sample data for demonstration
function generateSampleData() {
    showLoading(true);

    setTimeout(() => {
        const sampleData = {
            nodes: [
                { id: "main.js", type: "file", group: 1, size: 20 },
                { id: "utils.js", type: "file", group: 1, size: 15 },
                { id: "api.js", type: "file", group: 1, size: 18 },
                { id: "components/", type: "folder", group: 2, size: 25 },
                { id: "Button.js", type: "file", group: 1, size: 12 },
                { id: "Modal.js", type: "file", group: 1, size: 14 },
                { id: "initApp()", type: "function", group: 3, size: 10 },
                { id: "fetchData()", type: "function", group: 3, size: 8 },
                { id: "handleClick()", type: "function", group: 3, size: 8 },
                { id: "validateInput()", type: "function", group: 3, size: 6 },
                { id: "styles.css", type: "file", group: 4, size: 10 },
                { id: "package.json", type: "file", group: 4, size: 8 }
            ],
            links: [
                { source: "main.js", target: "utils.js", type: "import" },
                { source: "main.js", target: "api.js", type: "import" },
                { source: "main.js", target: "initApp()", type: "calls" },
                { source: "api.js", target: "fetchData()", type: "defines" },
                { source: "components/", target: "Button.js", type: "contains" },
                { source: "components/", target: "Modal.js", type: "contains" },
                { source: "Button.js", target: "handleClick()", type: "defines" },
                { source: "utils.js", target: "validateInput()", type: "defines" },
                { source: "main.js", target: "styles.css", type: "import" },
                { source: "initApp()", target: "fetchData()", type: "calls" },
                { source: "handleClick()", target: "validateInput()", type: "calls" }
            ]
        };

        updateVisualization(sampleData.nodes, sampleData.links);
        updateFileTree(sampleData.nodes);
        showLoading(false);
    }, 1000);
}

// Simulate GitHub repository loading
function loadFromGitHub() {
    const url = document.getElementById("repoUrl").value.trim();
    if (!url) {
        alert("Please enter a GitHub repository URL");
        return;
    }

    showLoading(true);

    // Simulate API call delay
    setTimeout(() => {
        alert("GitHub integration would require a backend service to clone and analyze repositories. For now, try the sample data or upload local files.");
        showLoading(false);
    }, 2000);
}


// Initialize D3 visualization
function initVisualization() {
    svg = d3.select("#vizSvg");
    const container = svg.node().parentElement;
    const width = container.clientWidth;
    const height = container.clientHeight;

    svg.attr("width", width).attr("height", height);

    zoom = d3.zoom()
        .scaleExtent([0.1, 10])
        .on("zoom", (event) => {
            g.attr("transform", event.transform);
        });

    svg.call(zoom);
    g = svg.append("g");

    // Initialize simulation
    simulation = d3.forceSimulation()
        .force("link", d3.forceLink().id(d => d.id).distance(100))
        .force("charge", d3.forceManyBody().strength(-100))
        .force("center", d3.forceCenter(width / 2, height / 2))
        .force("collision", d3.forceCollide().radius(30));

    // Update force strength slider
    document.getElementById("forceSlider").addEventListener("input", (e) => {
        simulation.force("charge").strength(-parseInt(e.target.value));
        simulation.alpha(0.3).restart();
    });

    // Update zoom slider
    document.getElementById("zoomSlider").addEventListener("input", (e) => {
        const scale = parseFloat(e.target.value);
        svg.transition().duration(300).call(
            zoom.transform,
            d3.zoomIdentity.scale(scale)
        );
    });
}

// Generate sample data for demonstration
function generateSampleData() {
    showLoading(true);

    setTimeout(() => {
        const sampleData = {
            nodes: [
                { id: "main.js", type: "file", group: 1, size: 20 },
                { id: "utils.js", type: "file", group: 1, size: 15 },
                { id: "api.js", type: "file", group: 1, size: 18 },
                { id: "components/", type: "folder", group: 2, size: 25 },
                { id: "Button.js", type: "file", group: 1, size: 12 },
                { id: "Modal.js", type: "file", group: 1, size: 14 },
                { id: "initApp()", type: "function", group: 3, size: 10 },
                { id: "fetchData()", type: "function", group: 3, size: 8 },
                { id: "handleClick()", type: "function", group: 3, size: 8 },
                { id: "validateInput()", type: "function", group: 3, size: 6 },
                { id: "styles.css", type: "file", group: 4, size: 10 },
                { id: "package.json", type: "file", group: 4, size: 8 }
            ],
            links: [
                { source: "main.js", target: "utils.js", type: "import" },
                { source: "main.js", target: "api.js", type: "import" },
                { source: "main.js", target: "initApp()", type: "calls" },
                { source: "api.js", target: "fetchData()", type: "defines" },
                { source: "components/", target: "Button.js", type: "contains" },
                { source: "components/", target: "Modal.js", type: "contains" },
                { source: "Button.js", target: "handleClick()", type: "defines" },
                { source: "utils.js", target: "validateInput()", type: "defines" },
                { source: "main.js", target: "styles.css", type: "import" },
                { source: "initApp()", target: "fetchData()", type: "calls" },
                { source: "handleClick()", target: "validateInput()", type: "calls" }
            ]
        };

        updateVisualization(sampleData.nodes, sampleData.links);
        updateFileTree(sampleData.nodes);
        showLoading(false);
    }, 1000);
}


// Load and analyze uploaded files
function loadFromFiles() {
    const files = document.getElementById("folderInput").files;
    if (!files.length) {
        alert("Please select a folder");
        return;
    }

    showLoading(true);
    analyzeFiles(files);
}

// Analyze uploaded files
function analyzeFiles(files) {
    const nodes = [];
    const links = [];
    const fileContents = {};

    // Read all files
    const filePromises = Array.from(files).map(file => {
        return new Promise((resolve) => {
            const reader = new FileReader();
            reader.onload = (e) => {
                fileContents[file.webkitRelativePath] = e.target.result;
                resolve();
            };
            reader.readAsText(file);
        });
    });

    Promise.all(filePromises).then(() => {
        // Create nodes for files and folders
        const paths = Object.keys(fileContents);
        const folders = new Set();

        paths.forEach(path => {
            const parts = path.split('/');

            // Add folder nodes
            for (let i = 1; i < parts.length; i++) {
                const folderPath = parts.slice(0, i).join('/') + '/';
                folders.add(folderPath);
            }

            // Add file node
            const fileType = getFileType(path);
            nodes.push({
                id: path,
                type: "file",
                group: getGroupByType(fileType),
                size: Math.min(20, Math.max(8, fileContents[path].length / 100))
            });
        });

        // Add folder nodes
        folders.forEach(folder => {
            nodes.push({
                id: folder,
                type: "folder",
                group: 2,
                size: 25
            });
        });

        // Analyze file contents for functions and imports
        paths.forEach(path => {
            const content = fileContents[path];
            const fileType = getFileType(path);

            if (fileType === 'js' || fileType === 'py') {
                // Extract functions
                const functions = extractFunctions(content, fileType);
                functions.forEach(func => {
                    const funcNode = {
                        id: `${path}::${func}`,
                        type: "function",
                        group: 3,
                        size: 8
                    };
                    nodes.push(funcNode);
                    links.push({
                        source: path,
                        target: funcNode.id,
                        type: "defines"
                    });
                });

                // Extract imports
                const imports = extractImports(content, fileType);
                imports.forEach(imp => {
                    const targetPath = resolveImportPath(imp, path, paths);
                    if (targetPath) {
                        links.push({
                            source: path,
                            target: targetPath,
                            type: "import"
                        });
                    }
                });
            }

            // Add folder containment relationships
            const folder = path.substring(0, path.lastIndexOf('/') + 1);
            if (folders.has(folder)) {
                links.push({
                    source: folder,
                    target: path,
                    type: "contains"
                });
            }
        });

        updateVisualization(nodes, links);
        updateFileTree(nodes);
        showLoading(false);
    });
}

// Extract functions from file content
function extractFunctions(content, fileType) {
    const functions = [];

    if (fileType === 'js') {
        // Match function declarations and expressions
        const funcRegex = /(?:function\s+(\w+)|const\s+(\w+)\s*=\s*(?:async\s+)?(?:\([^)]*\)\s*=>|\([^)]*\)\s*{)|(\w+)\s*:\s*(?:async\s+)?(?:function|\([^)]*\)\s*=>))/g;
        let match;
        while ((match = funcRegex.exec(content)) !== null) {
            const funcName = match[1] || match[2] || match[3];
            if (funcName) functions.push(funcName);
        }
    } else if (fileType === 'py') {
        // Match Python function definitions
        const funcRegex = /def\s+(\w+)\s*\(/g;
        let match;
        while ((match = funcRegex.exec(content)) !== null) {
            functions.push(match[1]);
        }
    }

    return functions;
}

// Extract imports from file content
function extractImports(content, fileType) {
    const imports = [];

    if (fileType === 'js') {
        // Match import statements
        const importRegex = /import.*?from\s+['"]([^'"]+)['"]/g;
        let match;
        while ((match = importRegex.exec(content)) !== null) {
            imports.push(match[1]);
        }

        // Match require statements
        const requireRegex = /require\s*\(\s*['"]([^'"]+)['"]\s*\)/g;
        while ((match = requireRegex.exec(content)) !== null) {
            imports.push(match[1]);
        }
    } else if (fileType === 'py') {
        // Match Python imports
        const importRegex = /(?:from\s+(\S+)\s+import|import\s+(\S+))/g;
        let match;
        while ((match = importRegex.exec(content)) !== null) {
            imports.push(match[1] || match[2]);
        }
    }

    return imports;
}

// Resolve import path to actual file path
function resolveImportPath(importPath, currentPath, allPaths) {
    // Handle relative imports
    if (importPath.startsWith('./') || importPath.startsWith('../')) {
        const currentDir = currentPath.substring(0, currentPath.lastIndexOf('/') + 1);
        const resolvedPath = resolvePath(currentDir + importPath);

        // Try different extensions
        const extensions = ['.js', '.py', '.ts', '.jsx', '/index.js'];
        for (const ext of extensions) {
            const fullPath = resolvedPath + ext;
            if (allPaths.includes(fullPath)) return fullPath;
        }
    }

    return null;
}

// Simple path resolver
function resolvePath(path) {
    const parts = path.split('/');
    const resolved = [];

    for (const part of parts) {
        if (part === '..') {
            resolved.pop();
        } else if (part !== '.' && part !== '') {
            resolved.push(part);
        }
    }

    return resolved.join('/');
}

// Get file type from extension
function getFileType(path) {
    const ext = path.split('.').pop().toLowerCase();
    const typeMap = {
        'js': 'js', 'jsx': 'js', 'ts': 'js', 'tsx': 'js',
        'py': 'py',
        'css': 'css', 'scss': 'css', 'sass': 'css',
        'html': 'html', 'htm': 'html'
    };
    return typeMap[ext] || 'default';
}

// Get group number by type
function getGroupByType(type) {
    const groupMap = {
        'js': 1, 'py': 1,
        'css': 4, 'html': 4,
        'default': 4
    };
    return groupMap[type] || 4;
}
// Split long text into multiple lines by character count
function wrapText(text, maxCharsPerLine) {
    const words = text.split(/[\s_\-]/);  // Break on underscore, dash, or space
    const lines = [];
    let line = "";

    words.forEach(word => {
        if ((line + word).length <= maxCharsPerLine) {
            line += (line ? " " : "") + word;
        } else {
            if (line) lines.push(line);
            line = word;
        }
    });
    if (line) lines.push(line);
    return lines;
}

// Update visualization with new data
function updateVisualization(nodeData, linkData) {
    nodes = nodeData;
    links = linkData;

    // Clear existing visualization
    g.selectAll("*").remove();

    // Create links
    const link = g.append("g")
        .attr("class", "links")
        .selectAll("line")
        .data(links)
        .enter().append("line")
        .attr("class", "link")
        .on("click", handleLinkClick)
        .on("mouseover", handleLinkMouseOver)
        .on("mouseout", handleMouseOut);

    // Create nodes
    const node = g.append("g")
        .attr("class", "nodes")
        .selectAll("g")
        .data(nodes)
        .enter().append("g")
        .attr("class", "node")
        .call(d3.drag()
            .on("start", dragstarted)
            .on("drag", dragged)
            .on("end", dragended))
        .on("click", handleNodeClick)
        .on("mouseover", handleNodeMouseOver)
        .on("mouseout", handleMouseOut);

    node.append("rect")
        .attr("x", d => -d.size)
        .attr("y", d => -d.size)
        .attr("width", d => d.size * 2)
        .attr("height", d => d.size * 2)
        .attr("rx", 6)
        .attr("fill", d => getNodeColor(d.type));

    // Add full function/file name labels centered in the node
    node.append("text")
        .attr("text-anchor", "middle")
        .attr("dy", "-0.35em")
        .style("font-size", "10px")
        .style("fill", "#ffffff")
        .style("pointer-events", "none")
        .attr("transform", function (d) {
            const numLines = wrapText(d.id.includes("::") ? d.id.split("::")[1] : d.id.split('/').pop(), 12).length;
            return `translate(0, ${-((numLines - 1) * 6)})`;
        })
        .each(function (d) {
            const label = d.id.includes("::") ? d.id.split("::")[1] : d.id.split('/').pop();
            const wrapped = wrapText(label, 12);  // Adjust line width here
            const text = d3.select(this);

            wrapped.forEach((line, i) => {
                text.append("tspan")
                    .attr("x", 0)
                    .attr("dy", i === 0 ? "0em" : "1.1em")
                    .text(line);
            });
        });

    // node.append("text")
    //     .attr("text-anchor", "middle")
    //     .attr("dy", ".35em")
    //     .style("font-size", "10px")
    //     .style("pointer-events", "none")
    //     .style("fill", "#fff")
    //     .text(d => {
    //         const label = d.id.includes("::") ? d.id.split("::")[1] : d.id.split('/').pop();
    //         return label;
    //     });
    //     node.append("text")
    //     // .attr("text-anchor", "middle")
    //     .style("font-size", "10px")
    //     .style("pointer-events", "none")
    //     .style("fill", "#fff")
    //     .each(function(d) {
    //         const label = d.id.includes("::") ? d.id.split("::")[1] : d.id.split('/').pop();
    //         const words = wrapText(label, 14); // Wrap label text at ~14 chars per line

    //         const text = d3.select(this);
    //         words.forEach((line, i) => {
    //             text.append("tspan")
    //                 .attr("x", 0)
    //                 .attr("dy", i === 0 ? "0.35em" : "1.1em")
    //                 .text(line);
    //         });
    //     });

    // Update simulation
    simulation.nodes(nodes);
    simulation.force("link").links(links);
    simulation.alpha(0.3).restart();

    // Update positions on tick
    simulation.on("tick", () => {
        link
            .attr("x1", d => d.source.x)
            .attr("y1", d => d.source.y)
            .attr("x2", d => d.target.x)
            .attr("y2", d => d.target.y);

        node
            .attr("transform", d => `translate(${d.x},${d.y})`);
    });
}

// Get color for node type
function getNodeColor(type) {
    const colors = {
        'file': '#3b82f6',
        'folder': '#f59e0b',
        'function': '#10b981',
        'dependency': '#ef4444'
    };
    return colors[type] || '#6b7280';
}

// Handle node click
function handleNodeClick(event, d) {
    event.stopPropagation();

    if (selectedNodes.has(d.id)) {
        selectedNodes.delete(d.id);
    } else {
        selectedNodes.add(d.id);
    }

    highlightConnections(d);
}

// Handle link click
function handleLinkClick(event, d) {
    event.stopPropagation();

    // Highlight the clicked link
    g.selectAll(".link").classed("highlighted", false);
    d3.select(event.target).classed("highlighted", true);

    // Also highlight connected nodes
    g.selectAll(".node").classed("highlighted", false);
    g.selectAll(".node")
        .filter(n => n.id === d.source.id || n.id === d.target.id)
        .classed("highlighted", true);
}

// Highlight connections for a node
function highlightConnections(node) {
    // Reset all highlights
    g.selectAll(".link").classed("highlighted", false);
    g.selectAll(".node").classed("highlighted", false);

    // Highlight selected nodes
    g.selectAll(".node")
        .filter(d => selectedNodes.has(d.id))
        .classed("highlighted", true);

    // Highlight connected links
    g.selectAll(".link")
        .filter(d => selectedNodes.has(d.source.id) || selectedNodes.has(d.target.id))
        .classed("highlighted", true);
}

// Handle node mouseover
function handleNodeMouseOver(event, d) {
    const tooltip = document.getElementById("tooltip");
    tooltip.style.opacity = "1";
    tooltip.style.left = (event.pageX + 10) + "px";
    tooltip.style.top = (event.pageY - 10) + "px";

    const connections = links.filter(l =>
        l.source.id === d.id || l.target.id === d.id
    ).length;

    tooltip.innerHTML = `
                <strong>${d.id}</strong><br>
                Type: ${d.type}<br>
                Connections: ${connections}
            `;
}

// Handle link mouseover
function handleLinkMouseOver(event, d) {
    const tooltip = document.getElementById("tooltip");
    tooltip.style.opacity = "1";
    tooltip.style.left = (event.pageX + 10) + "px";
    tooltip.style.top = (event.pageY - 10) + "px";

    tooltip.innerHTML = `
                <strong>${d.source.id}</strong><br>
                ${d.type}<br>
                <strong>${d.target.id}</strong>
            `;
}

// Handle mouseout
function handleMouseOut() {
    document.getElementById("tooltip").style.opacity = "0";
}

// Update file tree in sidebar
function updateFileTree(nodeData) {
    const fileTree = document.getElementById("fileTree");
    fileTree.innerHTML = "";

    const files = nodeData.filter(d => d.type === "file" || d.type === "folder");

    files.forEach(file => {
        const li = document.createElement("li");
        li.className = "file-item";
        li.onclick = () => selectFileInTree(li, file);

        const icon = document.createElement("div");
        icon.className = `file-icon ${getFileType(file.id)}`;
        if (file.type === "folder") icon.className += " folder";

        const text = document.createElement("span");
        text.textContent = file.id.split('/').pop() || file.id;

        li.appendChild(icon);
        li.appendChild(text);
        fileTree.appendChild(li);
    });
}

// Select file in tree
function selectFileInTree(element, file) {
    // Remove previous selection
    document.querySelectorAll('.file-item').forEach(item => {
        item.classList.remove('selected');
    });

    // Add selection to clicked item
    element.classList.add('selected');

    // Highlight corresponding node in visualization
    selectedNodes.clear();
    selectedNodes.add(file.id);
    highlightConnections(file);
}

// Show/hide loading indicator
function showLoading(show) {
    document.getElementById("loading").style.display = show ? "block" : "none";
}

// Reset view to center
function resetView() {
    const container = svg.node().parentElement;
    const width = container.clientWidth;
    const height = container.clientHeight;

    svg.transition().duration(750).call(
        zoom.transform,
        d3.zoomIdentity.translate(width / 2, height / 2).scale(1)
    );

    // Reset sliders
    document.getElementById("zoomSlider").value = 1;
    document.getElementById("forceSlider").value = 100;

    // Reset simulation
    simulation.force("charge").strength(-100);
    simulation.alpha(0.3).restart();
}

// Drag functions
function dragstarted(event, d) {
    if (!event.active) simulation.alphaTarget(0.3).restart();
    d.fx = d.x;
    d.fy = d.y;
}

function dragged(event, d) {
    d.fx = event.x;
    d.fy = event.y;
}

function dragended(event, d) {
    if (!event.active) simulation.alphaTarget(0);
    d.fx = null;
    d.fy = null;
}

// Clear selection when clicking on empty space
function clearSelection() {
    selectedNodes.clear();
    g.selectAll(".node").classed("highlighted", false);
    g.selectAll(".link").classed("highlighted", false);
    document.querySelectorAll('.file-item').forEach(item => {
        item.classList.remove('selected');
    });
}

// Initialize the application
function init() {
    initVisualization();

    // Add click handler to clear selection
    svg.on("click", clearSelection);

    // Handle window resize
    window.addEventListener('resize', () => {
        const container = svg.node().parentElement;
        const width = container.clientWidth;
        const height = container.clientHeight;
        svg.attr("width", width).attr("height", height);
        simulation.force("center", d3.forceCenter(width / 2, height / 2));
    });
}

// Start the application when page loads
document.addEventListener('DOMContentLoaded', init);
