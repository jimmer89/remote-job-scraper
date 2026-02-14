#!/usr/bin/env python3
"""
Edit logo to match ChillJobs branding
"""
from PIL import Image, ImageDraw, ImageFont
import colorsys

def rgb_to_hsv(r, g, b):
    return colorsys.rgb_to_hsv(r/255, g/255, b/255)

def replace_colors(img):
    """Replace colors to match ChillJobs branding"""
    pixels = img.load()
    width, height = img.size
    
    # New ChillJobs colors
    lavender_dark = (107, 93, 211)   # #6B5DD3 - primary dark
    pink = (236, 72, 153)            # #EC4899 - pink accent
    mint = (16, 185, 129)            # #10B981 - secondary
    mint_light = (110, 231, 183)     # #6EE7B7 - secondary light
    
    for y in range(height):
        for x in range(width):
            pixel = pixels[x, y]
            if len(pixel) == 4:
                r, g, b, a = pixel
            else:
                r, g, b = pixel
                a = 255
            
            # Skip transparent or white pixels
            if a < 50 or (r > 240 and g > 240 and b > 240):
                continue
            
            h, s, v = rgb_to_hsv(r, g, b)
            
            # Dark teal/blue (hue ~180-200) → Lavender dark
            if 0.45 < h < 0.55 and s > 0.3:
                new_r, new_g, new_b = lavender_dark
                brightness_factor = v
                new_r = int(new_r * brightness_factor / 0.7)
                new_g = int(new_g * brightness_factor / 0.7)
                new_b = int(new_b * brightness_factor / 0.7)
                new_r = min(255, max(0, new_r))
                new_g = min(255, max(0, new_g))
                new_b = min(255, max(0, new_b))
                pixels[x, y] = (new_r, new_g, new_b, a)
            
            # Orange (hue ~30-50) → Pink
            elif 0.05 < h < 0.15 and s > 0.4:
                new_r, new_g, new_b = pink
                brightness_factor = v
                new_r = int(new_r * brightness_factor / 0.8)
                new_g = int(new_g * brightness_factor / 0.8) 
                new_b = int(new_b * brightness_factor / 0.8)
                new_r = min(255, max(0, new_r))
                new_g = min(255, max(0, new_g))
                new_b = min(255, max(0, new_b))
                pixels[x, y] = (new_r, new_g, new_b, a)
            
            # Light blue/cyan → Mint
            elif 0.45 < h < 0.58 and 0.2 < s < 0.7:
                if v > 0.6:
                    new_r, new_g, new_b = mint_light
                else:
                    new_r, new_g, new_b = mint
                brightness_factor = v
                new_r = int(new_r * brightness_factor / 0.7)
                new_g = int(new_g * brightness_factor / 0.7)
                new_b = int(new_b * brightness_factor / 0.7)
                new_r = min(255, max(0, new_r))
                new_g = min(255, max(0, new_g))
                new_b = min(255, max(0, new_b))
                pixels[x, y] = (new_r, new_g, new_b, a)
    
    return img

def add_text(img):
    """Replace text with CHILL JOBS"""
    draw = ImageDraw.Draw(img)
    width, height = img.size
    
    # Cover ALL old text area with white (from below the waves to bottom)
    # Need to cover starting from just below the waves graphic
    text_area_top = int(height * 0.62)
    draw.rectangle([0, text_area_top, width, height], fill=(255, 255, 255, 255))
    
    # Try to load a nice font
    font_size_big = 80
    font_size_small = 55
    
    font_big = None
    font_small = None
    for font_name in ['/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf',
                     '/usr/share/fonts/truetype/liberation/LiberationSans-Bold.ttf',
                     '/usr/share/fonts/TTF/DejaVuSans-Bold.ttf',
                     '/usr/share/fonts/truetype/freefont/FreeSansBold.ttf']:
        try:
            font_big = ImageFont.truetype(font_name, font_size_big)
            font_small = ImageFont.truetype(font_name, font_size_small)
            break
        except:
            continue
    
    if font_big is None:
        font_big = ImageFont.load_default()
        font_small = ImageFont.load_default()
    
    # Color for text - lavender dark
    lavender_dark = (107, 93, 211)  # #6B5DD3
    
    # Draw "CHILL" centered
    text1 = "CHILL"
    bbox1 = draw.textbbox((0, 0), text1, font=font_big)
    text1_width = bbox1[2] - bbox1[0]
    text1_height = bbox1[3] - bbox1[1]
    text1_x = (width - text1_width) // 2
    text1_y = text_area_top + 20
    draw.text((text1_x, text1_y), text1, fill=lavender_dark, font=font_big)
    
    # Draw "JOBS" centered below
    text2 = "JOBS"
    bbox2 = draw.textbbox((0, 0), text2, font=font_small)
    text2_width = bbox2[2] - bbox2[0]
    text2_x = (width - text2_width) // 2
    text2_y = text1_y + text1_height + 15
    draw.text((text2_x, text2_y), text2, fill=lavender_dark, font=font_small)
    
    return img

def main():
    input_path = "/mnt/c/Users/jaume/Desktop/Untitled design.png"
    output_path = "/mnt/c/Users/jaume/Desktop/ChillJobs_logo.png"
    
    print(f"Loading {input_path}...")
    img = Image.open(input_path).convert('RGBA')
    
    print("Replacing colors...")
    img = replace_colors(img)
    
    print("Adding new text...")
    img = add_text(img)
    
    print(f"Saving to {output_path}...")
    img.save(output_path, 'PNG')
    print("Done!")

if __name__ == "__main__":
    main()
