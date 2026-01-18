#!/usr/bin/env python3
"""
Logo Generator Script (Python version)
Generates PNG logos from SVG for PWA and app icons
Usage: python scripts/generate-logo.py
"""

import os
import sys
from pathlib import Path

try:
    from PIL import Image, ImageDraw
except ImportError:
    print("Error: Pillow is required. Install it with: pip install Pillow")
    sys.exit(1)

def create_logo_image(size):
    """Create a logo image of the specified size"""
    # Create a dark background
    img = Image.new('RGBA', (size, size), color=(15, 15, 15, 255))
    draw = ImageDraw.Draw(img)
    
    # Calculate scaling factor
    scale = size / 200
    
    # Draw outer circle border
    border_width = max(1, int(2 * scale))
    margin = int(10 * scale)
    draw.ellipse(
        [(margin, margin), (size - margin, size - margin)],
        outline=(255, 99, 71, 255),
        width=border_width
    )
    
    # Draw center progress ring
    center = size // 2
    radius = int(75 * scale)
    ring_width = max(1, int(3 * scale))
    draw.arc(
        [(center - radius, center - radius), (center + radius, center + radius)],
        0, 360,
        fill=(255, 99, 71, 80),
        width=ring_width
    )
    
    # Draw subtle concentric circles
    for r in [int(60 * scale), int(45 * scale)]:
        draw.ellipse(
            [(center - r, center - r), (center + r, center + r)],
            outline=(255, 99, 71, 25),
            width=1
        )
    
    # Draw upward arrow (progress symbol)
    arrow_x = center
    arrow_y = center
    arrow_height = int(55 * scale)
    arrow_width = int(10 * scale)
    
    # Arrow stem
    line_width = max(2, int(4 * scale))
    draw.line(
        [(arrow_x, arrow_y + int(35 * scale)), (arrow_x, arrow_y - int(20 * scale))],
        fill=(255, 99, 71, 255),
        width=line_width
    )
    
    # Arrow head
    head_size = int(10 * scale)
    draw.polygon(
        [(arrow_x, arrow_y - int(20 * scale)), 
         (arrow_x - head_size, arrow_y - int(5 * scale)),
         (arrow_x + head_size, arrow_y - int(5 * scale))],
        fill=(255, 99, 71, 255)
    )
    
    # Draw checkmark circle (left side)
    check_x = center - int(35 * scale)
    check_y = center
    check_radius = int(22 * scale)
    draw.ellipse(
        [(check_x - check_radius, check_y - check_radius),
         (check_x + check_radius, check_y + check_radius)],
        outline=(76, 175, 80, 255),
        width=max(1, int(2.5 * scale))
    )
    
    # Checkmark symbol
    check_offset = int(8 * scale)
    draw.line(
        [(check_x - check_offset, check_y),
         (check_x - int(2 * scale), check_y + check_offset)],
        fill=(76, 175, 80, 255),
        width=max(2, int(3 * scale))
    )
    draw.line(
        [(check_x - int(2 * scale), check_y + check_offset),
         (check_x + int(8 * scale), check_y - int(4 * scale))],
        fill=(76, 175, 80, 255),
        width=max(2, int(3 * scale))
    )
    
    # Draw star circle (right side)
    star_x = center + int(35 * scale)
    star_y = center - int(10 * scale)
    star_radius = int(20 * scale)
    draw.ellipse(
        [(star_x - star_radius, star_y - star_radius),
         (star_x + star_radius, star_y + star_radius)],
        outline=(255, 99, 71, 255),
        width=max(1, int(2.5 * scale))
    )
    
    # Simple star in the circle
    star_size = int(8 * scale)
    draw.polygon(
        [(star_x, star_y - star_size),
         (star_x + int(2 * scale), star_y - int(2 * scale)),
         (star_x + star_size, star_y - int(2 * scale)),
         (star_x + int(3 * scale), star_y + int(2 * scale)),
         (star_x + int(5 * scale), star_y + star_size),
         (star_x, star_y + int(4 * scale)),
         (star_x - int(5 * scale), star_y + star_size),
         (star_x - int(3 * scale), star_y + int(2 * scale)),
         (star_x - star_size, star_y - int(2 * scale)),
         (star_x - int(2 * scale), star_y - int(2 * scale))],
        fill=(255, 99, 71, 255)
    )
    
    return img

def generate_logos():
    """Generate all required logo sizes"""
    logos = [
        (32, 'favicon-32x32.png'),
        (192, 'pwa-192x192.png'),
        (512, 'pwa-512x512.png'),
        (180, 'apple-touch-icon.png'),
    ]
    
    public_dir = Path(__file__).parent.parent / 'public'
    public_dir.mkdir(exist_ok=True)
    
    print('🎨 Generating app logos...\n')
    
    for size, filename in logos:
        try:
            img = create_logo_image(size)
            output_path = public_dir / filename
            img.save(output_path, 'PNG')
            print(f'✅ Generated {filename} ({size}x{size})')
        except Exception as e:
            print(f'❌ Failed to generate {filename}: {e}')
    
    # Convert 32x32 to favicon.ico
    try:
        favicon_path = public_dir / 'favicon-32x32.png'
        ico_path = public_dir / 'favicon.ico'
        img = Image.open(favicon_path)
        img.save(ico_path, 'ICO')
        print('✅ Generated favicon.ico')
    except Exception as e:
        print(f'❌ Failed to generate favicon.ico: {e}')
    
    print('\n✨ Logo generation complete!')

if __name__ == '__main__':
    generate_logos()
