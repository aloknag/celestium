import os

# --- Configuration ---

# List of directories to completely ignore.
# Adding a directory here means the script won't even look inside it.
EXCLUDE_DIRS = [
    'node_modules',
    'dist',
    '.git',
    '.vscode',
    '.idea',
    '__pycache__'
]

# List of specific files to ignore by name.
EXCLUDE_FILES = [
    'app.txt',          # Don't include the output file in itself
    'package-lock.json',# Often very large and not essential for high-level context
]
# Add the script's own name to the exclude list dynamically.
EXCLUDE_FILES.append(os.path.basename(__file__))


# File extensions to include. Add any other extensions you need.
INCLUDE_EXTENSIONS = [
    '.js', '.json', '.cjs', '.ts', '.tsx', '.css', '.html', '.md', '.svg'
]

# Specific files to include by name, even if their extension isn't listed above.
INCLUDE_FILES = [
    '.gitignore',
    'eslint.config.js',
    'vite.config.ts',
    'tailwind.config.cjs',
    'postcss.config.cjs'
]

OUTPUT_FILENAME = 'app.txt'

# --- Script ---

def should_exclude_dir(dir_path, exclude_list):
    """
    Checks if any part of the directory path matches the exclude list.
    This is useful for ignoring directories like '.git' anywhere in the tree.
    """
    # Normalize path for consistent matching
    normalized_path = dir_path.replace('\\', '/')
    path_parts = normalized_path.split('/')
    for excluded in exclude_list:
        if excluded in path_parts:
            return True
    return False

def generate_app_txt():
    """
    Walks through the project directory from where the script is run,
    collects content from specified files, and writes it into a single
    output file (app.txt).
    """
    script_dir = os.getcwd() # Run from the current working directory
    output_content = []

    print("Starting file collection...")

    for root, dirs, files in os.walk(script_dir, topdown=True):
        # Modify dirs in-place to prevent `os.walk` from descending into them
        dirs[:] = [d for d in dirs if not should_exclude_dir(os.path.join(root, d), EXCLUDE_DIRS)]

        # Sort files for consistent order
        for filename in sorted(files):
            # Check if the file should be excluded by name
            if filename in EXCLUDE_FILES:
                continue

            file_path = os.path.join(root, filename)
            
            # Get file extension
            _, extension = os.path.splitext(filename)
            
            # Check if the file should be included based on its name or extension
            if (filename in INCLUDE_FILES or extension in INCLUDE_EXTENSIONS):
                
                try:
                    with open(file_path, 'r', encoding='utf-8', errors='ignore') as f:
                        content = f.read()
                        
                        # Create a relative path for the header
                        relative_path = os.path.relpath(file_path, script_dir).replace('\\', '/')
                        header = f"<{relative_path}>"
                        
                        output_content.append(f"{header}\n\n{content}\n")
                        print(f"  + Added: {relative_path}")

                except Exception as e:
                    print(f"  - Error reading file {file_path}: {e}")

    try:
        output_path = os.path.join(script_dir, OUTPUT_FILENAME)
        with open(output_path, 'w', encoding='utf-8') as f:
            # Join with two newlines for better separation between files
            f.write("\n\n".join(output_content))
        print(f"\nSuccessfully generated {OUTPUT_FILENAME} with {len(output_content)} files.")
    except Exception as e:
        print(f"\nError writing to {OUTPUT_FILENAME}: {e}")

if __name__ == "__main__":
    generate_app_txt()
