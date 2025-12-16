
import sys
import collections
from PIL import Image

def get_dominant_colors(image_path, num_colors=5):
    try:
        image = Image.open(image_path)
        image = image.resize((150, 150))      # Resize for speed
        result = image.convert('P', palette=Image.ADAPTIVE, colors=num_colors)
        result = result.convert('RGB')
        
        main_colors = result.getcolors(150*150)
        
        # Sort by count
        main_colors.sort(key=lambda x: x[0], reverse=True)
        
        hex_colors = []
        for count, col in main_colors:
            hex_col = '#{:02x}{:02x}{:02x}'.format(col[0], col[1], col[2])
            hex_colors.append(hex_col)
            
        return hex_colors
    except Exception as e:
        print(f"Error: {e}")
        return []

if __name__ == "__main__":
    colors = get_dominant_colors('image.png')
    print("Dominant Colors:")
    for c in colors:
        print(c)
