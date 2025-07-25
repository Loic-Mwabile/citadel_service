import os
from PIL import Image, ImageOps
import math

def create_icon(logo_path, size, output_dir, name_prefix="icon"):
    # Create output directory if it doesn't exist
    os.makedirs(output_dir, exist_ok=True)
    
    # Open and process the logo
    logo = Image.open(logo_path).convert("RGBA")
    
    # Calculate the size to maintain aspect ratio
    logo_ratio = logo.width / logo.height
    if logo_ratio > 1:
        new_width = int(size * logo_ratio)
        new_height = size
    else:
        new_width = size
        new_height = int(size / logo_ratio)
    
    # Resize logo
    logo = logo.resize((new_width, new_height), Image.Resampling.LANCZOS)
    
    # Create a transparent background
    background = Image.new('RGBA', (size, size), (0, 0, 0, 0))
    
    # Calculate position to center the logo
    position = ((size - new_width) // 2, (size - new_height) // 2)
    
    # Paste the logo onto the background
    background.paste(logo, position, logo)
    
    # Save the icon
    output_path = os.path.join(output_dir, f"{name_prefix}-{size}x{size}.png")
    background.save(output_path, "PNG", optimize=True)
    print(f"Created: {output_path}")

def create_splash_screen(logo_path, width, height, output_dir):
    # Create output directory if it doesn't exist
    os.makedirs(output_dir, exist_ok=True)
    
    # Open and process the logo
    logo = Image.open(logo_path).convert("RGBA")
    
    # Calculate the size to make logo 60% of the smaller dimension
    min_dimension = min(width, height)
    logo_size = int(min_dimension * 0.6)
    
    # Resize logo
    logo_ratio = logo.width / logo.height
    if logo_ratio > 1:
        new_width = logo_size
        new_height = int(logo_size / logo_ratio)
    else:
        new_width = int(logo_size * logo_ratio)
        new_height = logo_size
    
    logo = logo.resize((new_width, new_height), Image.Resampling.LANCZOS)
    
    # Create a white background
    background = Image.new('RGB', (width, height), (255, 255, 255))
    
    # Calculate position to center the logo
    position = ((width - new_width) // 2, (height - new_height) // 2)
    
    # Convert logo to RGB for pasting onto RGB background
    logo_rgb = Image.new('RGB', logo.size, (255, 255, 255))
    logo_rgb.paste(logo, (0, 0), logo)
    
    # Paste the logo onto the background
    background.paste(logo_rgb, position, logo)
    
    # Save the splash screen
    output_path = os.path.join(output_dir, f"splash-{width}x{height}.png")
    background.save(output_path, "PNG", optimize=True)
    print(f"Created: {output_path}")

def main():
    # Set paths
    script_dir = os.path.dirname(os.path.abspath(__file__))
    logo_path = os.path.join(script_dir, "src", "assets", "logo.png")
    output_dir = os.path.join(script_dir, "citadel-icons")
    
    # Create output directory
    os.makedirs(output_dir, exist_ok=True)
    
    # Generate icons
    icon_sizes = [72, 96, 128, 144, 152, 192, 384, 512]
    for size in icon_sizes:
        create_icon(logo_path, size, output_dir, "icon")
    
    # Generate favicons (smaller icons)
    favicon_sizes = [16, 32, 48]
    for size in favicon_sizes:
        create_icon(logo_path, size, output_dir, "favicon")
    
    # Generate splash screens
    splash_sizes = [(640, 1136), (750, 1334), (1242, 2208), (1125, 2436)]
    for width, height in splash_sizes:
        create_splash_screen(logo_path, width, height, output_dir)
    
    print("\nAll icons and splash screens have been generated successfully!")
    print(f"Output directory: {output_dir}")

if __name__ == "__main__":
    main()
