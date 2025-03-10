function runCode() {
    let html = document.getElementById("html-code").value;
    let css = document.getElementById("css-code").value;
    let js = document.getElementById("js-code").value;

    // Get the iframe
    let output = document.getElementById("output");
    
    // Set sandbox attribute to allow scripts to run
    output.setAttribute('sandbox', 'allow-scripts allow-same-origin');
    
    // Write the content
    output.contentWindow.document.open();
    output.contentWindow.document.write(`
        <!DOCTYPE html>
        <html>
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <style>
                ${css}
            </style>
        </head>
        <body>
            ${html}
            <script>
                try {
                    ${js}
                } catch (error) {
                    console.error("JavaScript Error:", error.message);
                    document.body.innerHTML += '<div style="color: red; background: rgba(255,0,0,0.1); padding: 10px; margin-top: 10px; border-left: 4px solid red; font-family: monospace;">Error: ' + error.message + '</div>';
                }
            </script>
        </body>
        </html>
    `);
    output.contentWindow.document.close();
}

// Initialize tab functionality and code execution
document.addEventListener('DOMContentLoaded', function() {
    // Set up tab switching
    const tabButtons = document.querySelectorAll('.tab-button');
    const codeEditors = document.querySelectorAll('.code-editor');
    const autorunCheckbox = document.getElementById('autorun');
    let autorunEnabled = false;
    let typingTimer;
    const doneTypingInterval = 1000; // Time in ms (1 second)
    
    // Set up autorun functionality
    autorunCheckbox.addEventListener('change', function() {
        autorunEnabled = this.checked;
        if (autorunEnabled) {
            // Run immediately when autorun is enabled
            runCode();
        }
    });
    
    // Function to handle code changes with debounce
    function codeChanged() {
        if (autorunEnabled) {
            clearTimeout(typingTimer);
            typingTimer = setTimeout(runCode, doneTypingInterval);
        }
    }
    
    // Add input event listeners to all code editors
    document.getElementById('html-code').addEventListener('input', codeChanged);
    document.getElementById('css-code').addEventListener('input', codeChanged);
    document.getElementById('js-code').addEventListener('input', codeChanged);
    
    tabButtons.forEach(button => {
        button.addEventListener('click', () => {
            // Remove active class from all buttons and editors
            tabButtons.forEach(btn => btn.classList.remove('active'));
            codeEditors.forEach(editor => editor.classList.remove('active'));
            
            // Add active class to clicked button and corresponding editor
            button.classList.add('active');
            const tabName = button.getAttribute('data-tab');
            document.getElementById(`${tabName}-editor`).classList.add('active');
            
            // Focus the textarea in the active editor
            document.getElementById(`${tabName}-code`).focus();
            
            // Run code if autorun is enabled
            if (autorunEnabled) {
                runCode();
            }
        });
    });
    
    // Set focus to HTML editor on page load
    const htmlEditor = document.getElementById('html-code');
    setTimeout(() => {
        htmlEditor.focus();
    }, 100);
    
    // Add keyboard shortcut for running code (Ctrl+Enter)
    document.addEventListener('keydown', function(e) {
        if (e.ctrlKey && e.key === 'Enter') {
            e.preventDefault();
            runCode();
        }
    });
    
    // Run code once on page load to initialize the output
    runCode();
}); 