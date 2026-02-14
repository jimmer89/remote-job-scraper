#!/usr/bin/env python3
"""
Remove white background from logo, make it transparent, and crop to content
"""
from PIL import Image

def remove_white_background(img, tolerance=25):
    """Remove white/near-white background and make it transparent"""
    img = img.convert('RGBA')
    pixels = img.load()
    width, height = img.size
    
    for y in range(height):
        for x in range(width):
            r, g, b, a = pixels[x, y]
            
            # Check if pixel is white or near-white
            if r > (255 - tolerance) and g > (255 - tolerance) and b > (255 - tolerance):
                # Make it transparent
                pixels[x, y] = (255, 255, 255, 0)
    
    return img

def crop_to_content(img):
    """Crop image to remove transparent borders"""
    # Get the bounding box of non-transparent pixels
    bbox = img.getbbox()
    if bbox:
        # Add a small padding
        padding = 10
        left = max(0, bbox[0] - padding)
        top = max(0, bbox[1] - padding)
        right = min(img.width, bbox[2] + padding)
        bottom = min(img.height, bbox[3] + padding)
        img = img.crop((left, top, right, bottom))
    return img

def main():
    input_path = "/mnt/c/Users/jaume/Desktop/ChillJobs_logo.png"
    output_path = "frontend/public/logo.png"
    
    print("Loading image...")
    img = Image.open(input_path)
    
    print("Removing white background...")
    img = remove_white_background(img, tolerance=30)
    
    print("Cropping to content...")
    img = crop_to_content(img)
    
    print(f"Final size: {img.size}")
    print(f"Saving to {output_path}...")
    img.save(output_path, 'PNG')
    
    # Also save a copy to desktop
    desktop_output = "/mnt/c/Users/jaume/Desktop/ChillJobs_logo_transparent.png"
    img.save(desktop_output, 'PNG')
    print(f"Also saved to {desktop_output}")
    print("Done!")

if __name__ == "__main__":
    main()
