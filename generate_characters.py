import zlib
import struct
import math
import wave
import os

def write_png(filename, width, height, pixels):
    raw_data = bytearray()
    for y in range(height):
        raw_data.append(0) # filter type 0
        for x in range(width):
            idx = y * width + x
            r, g, b, a = pixels[idx]
            raw_data.extend([r, g, b, a])
    
    compressed = zlib.compress(raw_data)
    png = bytearray(b'\x89PNG\r\n\x1a\n')
    
    ihdr_data = struct.pack('>IIBBBBB', width, height, 8, 6, 0, 0, 0)
    ihdr_crc = zlib.crc32(b'IHDR' + ihdr_data)
    png.extend(struct.pack('>I', len(ihdr_data)))
    png.extend(b'IHDR')
    png.extend(ihdr_data)
    png.extend(struct.pack('>I', ihdr_crc))
    
    idat_crc = zlib.crc32(b'IDAT' + compressed)
    png.extend(struct.pack('>I', len(compressed)))
    png.extend(b'IDAT')
    png.extend(compressed)
    png.extend(struct.pack('>I', idat_crc))
    
    iend_crc = zlib.crc32(b'IEND')
    png.extend(struct.pack('>I', 0))
    png.extend(b'IEND')
    png.extend(struct.pack('>I', iend_crc))
    
    with open(filename, 'wb') as f:
        f.write(png)

def create_character_sprite(char_type="romanowski", state="idle"):
    width, height = 64, 80
    pixels = [(0, 0, 0, 0)] * (width * height)
    
    def set_pixel(x, y, r, g, b, a=255):
        if 0 <= x < width and 0 <= y < height:
            pixels[y * width + x] = (r, g, b, a)
            
    def fill_rect(x1, y1, x2, y2, r, g, b, a=255):
        for y in range(y1, y2 + 1):
            for x in range(x1, x2 + 1):
                set_pixel(x, y, r, g, b, a)

    def fill_circle(cx, cy, radius, r, g, b, a=255):
        for y in range(cy - radius, cy + radius + 1):
            for x in range(cx - radius, cx + radius + 1):
                if (x - cx)**2 + (y - cy)**2 <= radius**2:
                    set_pixel(x, y, r, g, b, a)

    # Shadow
    for y in range(72, 78):
        for x in range(16, 48):
            if ((x - 32) / 16)**2 + ((y - 75) / 3)**2 <= 1:
                set_pixel(x, y, 0, 0, 0, 70)

    skin_r, skin_g, skin_b = 255, 205, 160
    
    if char_type == "romanowski":
        # ROMANOWSKI: Grey Levi's tee, red box logo, curly hair, friendly smile
        hair_r, hair_g, hair_b = 185, 130, 80 # light brown/blonde curly
        shirt_r, shirt_g, shirt_b = 165, 170, 175 # grey tee
        pants_r, pants_g, pants_b = 50, 70, 100 # blue jeans
        shoe_r, shoe_g, shoe_b = 230, 230, 230

        # Legs
        if state == "walk":
            fill_rect(21, 55, 27, 72, pants_r, pants_g, pants_b)
            fill_rect(37, 55, 43, 68, pants_r, pants_g, pants_b)
            fill_rect(19, 70, 27, 75, shoe_r, shoe_g, shoe_b)
            fill_rect(37, 66, 45, 71, shoe_r, shoe_g, shoe_b)
        else:
            fill_rect(23, 55, 29, 72, pants_r, pants_g, pants_b)
            fill_rect(35, 55, 41, 72, pants_r, pants_g, pants_b)
            fill_rect(21, 71, 29, 75, shoe_r, shoe_g, shoe_b)
            fill_rect(35, 71, 43, 75, shoe_r, shoe_g, shoe_b)

        # Body (Chubby grey tee)
        fill_rect(18, 32, 46, 56, shirt_r, shirt_g, shirt_b)
        # Red Levi's logo box on chest
        fill_rect(24, 40, 40, 47, 215, 30, 40)
        fill_rect(26, 42, 38, 45, 255, 255, 255) # White logo text bar

        # Arms
        if state == "shout":
            fill_rect(11, 22, 17, 44, shirt_r, shirt_g, shirt_b)
            fill_circle(14, 20, 4, skin_r, skin_g, skin_b)
            fill_rect(47, 22, 53, 44, shirt_r, shirt_g, shirt_b)
            fill_circle(50, 20, 4, skin_r, skin_g, skin_b)
        else:
            fill_rect(14, 33, 18, 48, shirt_r, shirt_g, shirt_b)
            fill_circle(16, 50, 3, skin_r, skin_g, skin_b)
            fill_rect(46, 33, 50, 48, shirt_r, shirt_g, shirt_b)
            fill_circle(48, 50, 3, skin_r, skin_g, skin_b)

        # Head (Round cheerful face)
        fill_circle(32, 20, 13, skin_r, skin_g, skin_b)
        # Curly hair tufts
        for y in range(8, 19):
            for x in range(18, 46):
                if (x - 32)**2 + (y - 18)**2 <= 14**2 and y <= 16:
                    set_pixel(x, y, hair_r, hair_g, hair_b)
        fill_circle(24, 9, 5, hair_r, hair_g, hair_b)
        fill_circle(32, 7, 5, hair_r, hair_g, hair_b)
        fill_circle(40, 9, 5, hair_r, hair_g, hair_b)
        fill_circle(28, 11, 4, hair_r, hair_g, hair_b)
        fill_circle(36, 11, 4, hair_r, hair_g, hair_b)

        # Face
        if state == "shout":
            fill_circle(32, 25, 6, 170, 25, 25)
            fill_rect(29, 22, 35, 24, 255, 255, 255)
            fill_circle(27, 18, 3, 255, 255, 255)
            set_pixel(27, 18, 0, 0, 0)
            fill_circle(37, 18, 3, 255, 255, 255)
            set_pixel(37, 18, 0, 0, 0)
        else:
            # Friendly smile with dimples
            fill_circle(27, 19, 2, 255, 255, 255)
            set_pixel(28, 19, 40, 30, 20)
            fill_circle(37, 19, 2, 255, 255, 255)
            set_pixel(38, 19, 40, 30, 20)
            fill_rect(28, 26, 36, 27, 180, 60, 60)
            set_pixel(37, 25, 180, 60, 60)
            set_pixel(27, 25, 180, 60, 60)

    elif char_type == "leszczynski":
        # LESZCZYŃSKI: Black t-shirt, thumbs up pose, dark wavy bangs
        hair_r, hair_g, hair_b = 65, 45, 30 # dark brown wavy
        shirt_r, shirt_g, shirt_b = 20, 20, 20 # black tee
        pants_r, pants_g, pants_b = 40, 45, 55
        shoe_r, shoe_g, shoe_b = 240, 240, 240

        # Legs
        if state == "walk":
            fill_rect(23, 54, 28, 72, pants_r, pants_g, pants_b)
            fill_rect(36, 54, 41, 68, pants_r, pants_g, pants_b)
            fill_rect(21, 70, 28, 75, shoe_r, shoe_g, shoe_b)
            fill_rect(36, 66, 43, 71, shoe_r, shoe_g, shoe_b)
        else:
            fill_rect(24, 54, 29, 72, pants_r, pants_g, pants_b)
            fill_rect(35, 54, 40, 72, pants_r, pants_g, pants_b)
            fill_rect(22, 71, 29, 75, shoe_r, shoe_g, shoe_b)
            fill_rect(35, 71, 42, 75, shoe_r, shoe_g, shoe_b)

        # Body (Black tee)
        fill_rect(20, 32, 44, 55, shirt_r, shirt_g, shirt_b)

        # Arms (with THUMBS UP pose on right hand!)
        if state == "shout":
            fill_rect(13, 22, 19, 44, shirt_r, shirt_g, shirt_b)
            fill_circle(16, 20, 4, skin_r, skin_g, skin_b)
            fill_rect(45, 22, 51, 44, shirt_r, shirt_g, shirt_b)
            fill_circle(48, 20, 4, skin_r, skin_g, skin_b)
        else:
            fill_rect(15, 34, 19, 48, shirt_r, shirt_g, shirt_b)
            fill_circle(17, 50, 3, skin_r, skin_g, skin_b)
            # Right arm raised with thumbs up 👍
            fill_rect(44, 32, 50, 44, shirt_r, shirt_g, shirt_b)
            fill_circle(52, 40, 4, skin_r, skin_g, skin_b) # fist
            fill_rect(51, 34, 53, 38, skin_r, skin_g, skin_b) # thumb up!

        # Head
        fill_circle(32, 20, 12, skin_r, skin_g, skin_b)
        # Dark wavy curtain bangs/hair
        for y in range(8, 20):
            for x in range(19, 45):
                if (x - 32)**2 + (y - 18)**2 <= 13**2 and y <= 16:
                    set_pixel(x, y, hair_r, hair_g, hair_b)
        # Bangs hanging in front
        fill_rect(23, 14, 26, 20, hair_r, hair_g, hair_b)
        fill_rect(29, 14, 32, 19, hair_r, hair_g, hair_b)
        fill_rect(36, 14, 41, 20, hair_r, hair_g, hair_b)

        # Face
        if state == "shout":
            fill_circle(32, 25, 6, 170, 25, 25)
            fill_rect(30, 22, 34, 24, 255, 255, 255)
            fill_circle(27, 18, 3, 255, 255, 255)
            set_pixel(27, 18, 0, 0, 0)
            fill_circle(37, 18, 3, 255, 255, 255)
            set_pixel(37, 18, 0, 0, 0)
        else:
            # Confident expression
            fill_circle(27, 19, 2, 255, 255, 255)
            set_pixel(28, 19, 20, 20, 20)
            fill_circle(37, 19, 2, 255, 255, 255)
            set_pixel(38, 19, 20, 20, 20)
            fill_rect(29, 25, 35, 26, 160, 60, 60)

    else:
        # WOLFF: Mid otyły w czarnej puchowej kurtce, czarne spodnie, messy blonde hair
        hair_r, hair_g, hair_b = 190, 150, 95 # messy blonde/light brown
        jacket_r, jacket_g, jacket_b = 25, 25, 28 # black puffer jacket
        pants_r, pants_g, pants_b = 28, 28, 32 # black pants
        shoe_r, shoe_g, shoe_b = 245, 245, 245 # white sneakers

        # Legs (Wide black pants)
        if state == "walk":
            fill_rect(20, 54, 27, 72, pants_r, pants_g, pants_b)
            fill_rect(37, 54, 44, 68, pants_r, pants_g, pants_b)
            fill_rect(18, 70, 27, 75, shoe_r, shoe_g, shoe_b)
            fill_rect(37, 66, 46, 71, shoe_r, shoe_g, shoe_b)
        else:
            fill_rect(22, 54, 29, 72, pants_r, pants_g, pants_b)
            fill_rect(35, 54, 42, 72, pants_r, pants_g, pants_b)
            fill_rect(20, 71, 29, 75, shoe_r, shoe_g, shoe_b)
            fill_rect(35, 71, 44, 75, shoe_r, shoe_g, shoe_b)

        # Body (Big black puffer jacket with horizontal stitch lines)
        fill_rect(17, 30, 47, 56, jacket_r, jacket_g, jacket_b)
        # Puffer segments / horizontal stitches
        fill_rect(18, 38, 46, 39, 45, 45, 50)
        fill_rect(18, 46, 46, 47, 45, 45, 50)
        # Center zipper
        fill_rect(31, 30, 33, 56, 60, 60, 65)

        # Puffy sleeves
        if state == "shout":
            fill_rect(10, 22, 18, 44, jacket_r, jacket_g, jacket_b)
            fill_circle(14, 20, 4, skin_r, skin_g, skin_b)
            fill_rect(46, 22, 54, 44, jacket_r, jacket_g, jacket_b)
            fill_circle(50, 20, 4, skin_r, skin_g, skin_b)
        else:
            # Gesturing hands in front
            fill_rect(13, 33, 20, 48, jacket_r, jacket_g, jacket_b)
            fill_circle(18, 51, 3, skin_r, skin_g, skin_b)
            fill_rect(44, 33, 51, 48, jacket_r, jacket_g, jacket_b)
            fill_circle(46, 51, 3, skin_r, skin_g, skin_b)

        # Head
        fill_circle(32, 19, 12, skin_r, skin_g, skin_b)
        # Messy blonde hair
        for y in range(7, 19):
            for x in range(19, 45):
                if (x - 32)**2 + (y - 18)**2 <= 13**2 and y <= 15:
                    set_pixel(x, y, hair_r, hair_g, hair_b)
        fill_circle(24, 8, 5, hair_r, hair_g, hair_b)
        fill_circle(32, 6, 5, hair_r, hair_g, hair_b)
        fill_circle(40, 8, 5, hair_r, hair_g, hair_b)
        fill_rect(22, 13, 27, 17, hair_r, hair_g, hair_b)
        fill_rect(36, 13, 41, 17, hair_r, hair_g, hair_b)

        # Face
        if state == "shout":
            fill_circle(32, 24, 6, 170, 25, 25)
            fill_rect(30, 21, 34, 23, 255, 255, 255)
            fill_circle(27, 17, 3, 255, 255, 255)
            set_pixel(27, 17, 0, 0, 0)
            fill_circle(37, 17, 3, 255, 255, 255)
            set_pixel(37, 17, 0, 0, 0)
        else:
            fill_circle(27, 18, 2, 255, 255, 255)
            set_pixel(28, 18, 50, 40, 30)
            fill_circle(37, 18, 2, 255, 255, 255)
            set_pixel(38, 18, 50, 40, 30)
            fill_rect(29, 24, 35, 25, 170, 70, 70)

    return pixels

def create_item_sprite(item_type="mleko"):
    width, height = 32, 32
    pixels = [(0, 0, 0, 0)] * (width * height)
    
    def set_pixel(x, y, r, g, b, a=255):
        if 0 <= x < width and 0 <= y < height:
            pixels[y * width + x] = (r, g, b, a)
            
    def fill_rect(x1, y1, x2, y2, r, g, b, a=255):
        for y in range(y1, y2 + 1):
            for x in range(x1, x2 + 1):
                set_pixel(x, y, r, g, b, a)

    if item_type == "mleko":
        # Milk bottle / carton
        fill_rect(10, 8, 22, 28, 245, 245, 250)
        fill_rect(12, 4, 20, 7, 52, 152, 219) # Blue cap
        fill_rect(10, 16, 22, 22, 52, 152, 219) # Blue label
        fill_rect(14, 18, 18, 20, 255, 255, 255) # "MILK"
    elif item_type == "kleszcz":
        # Tick (kleszcz) with little creepy legs
        # Body
        for y in range(10, 24):
            for x in range(10, 22):
                if ((x - 16)/5)**2 + ((y - 17)/6)**2 <= 1:
                    set_pixel(x, y, 70, 40, 30)
        # Head
        for y in range(6, 11):
            for x in range(13, 19):
                if ((x - 16)/2.5)**2 + ((y - 8)/2)**2 <= 1:
                    set_pixel(x, y, 40, 20, 15)
        # Legs
        legs = [(7, 12, 11, 14), (6, 17, 11, 17), (7, 22, 11, 20),
                (21, 14, 25, 12), (21, 17, 26, 17), (21, 20, 25, 22)]
        for x1, y1, x2, y2 in legs:
            fill_rect(min(x1, x2), min(y1, y2), max(x1, x2), max(y1, y2), 30, 20, 15)

    return pixels

def main():
    target_dir = os.path.join("public", "assets")
    os.makedirs(target_dir, exist_ok=True)
    
    # 1. Romanowski sprites
    write_png(os.path.join(target_dir, "romanowski.png"), 64, 80, create_character_sprite("romanowski", "idle"))
    write_png(os.path.join(target_dir, "romanowskiidzie.png"), 64, 80, create_character_sprite("romanowski", "walk"))
    write_png(os.path.join(target_dir, "romanowskikrzyczy.png"), 64, 80, create_character_sprite("romanowski", "shout"))
    
    # 2. Leszczyński sprites
    write_png(os.path.join(target_dir, "leszczynski.png"), 64, 80, create_character_sprite("leszczynski", "idle"))
    write_png(os.path.join(target_dir, "leszczynskiidzie.png"), 64, 80, create_character_sprite("leszczynski", "walk"))
    write_png(os.path.join(target_dir, "leszczynskikrzyczy.png"), 64, 80, create_character_sprite("leszczynski", "shout"))

    # 3. Wolff sprites
    write_png(os.path.join(target_dir, "wolff.png"), 64, 80, create_character_sprite("wolff", "idle"))
    write_png(os.path.join(target_dir, "wolffidzie.png"), 64, 80, create_character_sprite("wolff", "walk"))
    write_png(os.path.join(target_dir, "wolffkrzyczy.png"), 64, 80, create_character_sprite("wolff", "shout"))

    # 4. Item sprites
    write_png(os.path.join(target_dir, "mleko.png"), 32, 32, create_item_sprite("mleko"))
    write_png(os.path.join(target_dir, "kleszcz.png"), 32, 32, create_item_sprite("kleszcz"))

    print("Wszystkie nowe sprite'y postaci i przedmiotów wygenerowane pomyślnie!")

if __name__ == "__main__":
    main()
