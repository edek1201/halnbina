import zlib
import struct
import math
import wave
import os

def write_png(filename, width, height, pixels):
    """
    pixels: list of (r, g, b, a) tuples of length width * height
    """
    raw_data = bytearray()
    for y in range(height):
        raw_data.append(0) # filter type 0 (None)
        for x in range(width):
            idx = y * width + x
            r, g, b, a = pixels[idx]
            raw_data.extend([r, g, b, a])
    
    compressed = zlib.compress(raw_data)
    
    png = bytearray(b'\x89PNG\r\n\x1a\n')
    
    # IHDR
    ihdr_data = struct.pack('>IIBBBBB', width, height, 8, 6, 0, 0, 0)
    ihdr_crc = zlib.crc32(b'IHDR' + ihdr_data)
    png.extend(struct.pack('>I', len(ihdr_data)))
    png.extend(b'IHDR')
    png.extend(ihdr_data)
    png.extend(struct.pack('>I', ihdr_crc))
    
    # IDAT
    idat_crc = zlib.crc32(b'IDAT' + compressed)
    png.extend(struct.pack('>I', len(compressed)))
    png.extend(b'IDAT')
    png.extend(compressed)
    png.extend(struct.pack('>I', idat_crc))
    
    # IEND
    iend_crc = zlib.crc32(b'IEND')
    png.extend(struct.pack('>I', 0))
    png.extend(b'IEND')
    png.extend(struct.pack('>I', iend_crc))
    
    with open(filename, 'wb') as f:
        f.write(png)

def create_sprite(state="idle", is_teacher=False):
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

    # Shadow under character
    for y in range(72, 78):
        for x in range(16, 48):
            if ((x - 32) / 16)**2 + ((y - 75) / 3)**2 <= 1:
                set_pixel(x, y, 0, 0, 0, 70)

    if not is_teacher:
        # ROMANOWSKI (Student)
        skin_r, skin_g, skin_b = 255, 205, 160
        hair_r, hair_g, hair_b = 60, 40, 25
        hoodie_r, hoodie_g, hoodie_b = 30, 110, 220
        jeans_r, jeans_g, jeans_b = 40, 60, 95
        shoe_r, shoe_g, shoe_b = 230, 230, 230

        # Legs
        if state == "walk":
            # Walking legs pose
            fill_rect(22, 54, 27, 72, jeans_r, jeans_g, jeans_b)
            fill_rect(36, 54, 41, 68, jeans_r, jeans_g, jeans_b)
            fill_rect(20, 70, 28, 75, shoe_r, shoe_g, shoe_b)
            fill_rect(36, 66, 44, 71, shoe_r, shoe_g, shoe_b)
        else:
            # Standing legs
            fill_rect(24, 54, 29, 72, jeans_r, jeans_g, jeans_b)
            fill_rect(34, 54, 39, 72, jeans_r, jeans_g, jeans_b)
            fill_rect(22, 71, 30, 75, shoe_r, shoe_g, shoe_b)
            fill_rect(33, 71, 41, 75, shoe_r, shoe_g, shoe_b)

        # Body (Blue school hoodie)
        fill_rect(20, 32, 43, 55, hoodie_r, hoodie_g, hoodie_b)
        # Collar / neck
        fill_rect(28, 30, 35, 33, skin_r, skin_g, skin_b)
        # Arms
        if state == "shout":
            # Raised arms in chaos
            fill_rect(13, 22, 19, 44, hoodie_r, hoodie_g, hoodie_b)
            fill_circle(16, 20, 4, skin_r, skin_g, skin_b)
            fill_rect(44, 22, 50, 44, hoodie_r, hoodie_g, hoodie_b)
            fill_circle(47, 20, 4, skin_r, skin_g, skin_b)
        elif state == "walk":
            fill_rect(15, 34, 19, 50, hoodie_r, hoodie_g, hoodie_b)
            fill_circle(17, 51, 3, skin_r, skin_g, skin_b)
            fill_rect(44, 32, 48, 48, hoodie_r, hoodie_g, hoodie_b)
            fill_circle(46, 49, 3, skin_r, skin_g, skin_b)
        else:
            fill_rect(16, 33, 20, 50, hoodie_r, hoodie_g, hoodie_b)
            fill_circle(18, 51, 3, skin_r, skin_g, skin_b)
            fill_rect(43, 33, 47, 50, hoodie_r, hoodie_g, hoodie_b)
            fill_circle(45, 51, 3, skin_r, skin_g, skin_b)

        # Head
        fill_circle(32, 20, 13, skin_r, skin_g, skin_b)
        
        # Hair
        for y in range(8, 20):
            for x in range(19, 45):
                if (x - 32)**2 + (y - 18)**2 <= 14**2 and y <= 16:
                    set_pixel(x, y, hair_r, hair_g, hair_b)
        # Hair tufts
        fill_circle(24, 10, 4, hair_r, hair_g, hair_b)
        fill_circle(32, 8, 4, hair_r, hair_g, hair_b)
        fill_circle(40, 10, 4, hair_r, hair_g, hair_b)

        # Face
        if state == "shout":
            # Wild shouting mouth
            fill_circle(32, 25, 6, 160, 20, 20)
            fill_rect(30, 22, 34, 24, 255, 255, 255) # Teeth
            fill_circle(32, 28, 3, 230, 80, 80) # Tongue
            # Big wild eyes
            fill_circle(27, 18, 3, 255, 255, 255)
            set_pixel(27, 18, 0, 0, 0)
            fill_circle(37, 18, 3, 255, 255, 255)
            set_pixel(37, 18, 0, 0, 0)
            # Brows
            fill_rect(24, 14, 29, 15, 60, 30, 10)
            fill_rect(35, 14, 40, 15, 60, 30, 10)
        else:
            # Normal / cheeky eyes
            fill_circle(27, 19, 2, 255, 255, 255)
            set_pixel(28, 19, 30, 40, 70)
            fill_circle(37, 19, 2, 255, 255, 255)
            set_pixel(38, 19, 30, 40, 70)
            # Cheeky grin
            fill_rect(29, 26, 35, 27, 180, 50, 50)
            set_pixel(35, 25, 180, 50, 50)

    else:
        # KATARZYNA HALBINA (Teacher)
        skin_r, skin_g, skin_b = 250, 210, 180
        hair_r, hair_g, hair_b = 130, 80, 40 # Auburn/brown bun
        coat_r, coat_g, coat_b = 235, 240, 245 # Lab coat / white apron
        skirt_r, skirt_g, skirt_b = 60, 40, 50

        if state == "board":
            # Back view (Writing on blackboard)
            # Hair bun
            fill_circle(32, 17, 14, hair_r, hair_g, hair_b)
            fill_circle(32, 9, 7, hair_r - 20, hair_r - 20, hair_b - 15) # Big hair bun on top
            # Lab coat back
            fill_rect(21, 31, 43, 62, coat_r, coat_g, coat_b)
            # Right arm raised writing with chalk!
            fill_rect(42, 20, 48, 40, coat_r, coat_g, coat_b)
            fill_circle(46, 18, 3, skin_r, skin_g, skin_b) # Hand
            fill_rect(46, 13, 48, 17, 255, 255, 255) # Chalk piece
            # Skirt & shoes
            fill_rect(24, 63, 40, 71, skirt_r, skirt_g, skirt_b)
            fill_rect(26, 72, 30, 75, 40, 30, 30)
            fill_rect(34, 72, 38, 75, 40, 30, 30)
        else:
            # Front view (Stern teacher looking at classroom)
            # Hair with bun
            fill_circle(32, 17, 14, hair_r, hair_g, hair_b)
            fill_circle(32, 8, 7, hair_r - 20, hair_r - 20, hair_b - 15)
            # Face
            fill_circle(32, 20, 11, skin_r, skin_g, skin_b)
            # Lab coat
            fill_rect(21, 31, 43, 62, coat_r, coat_g, coat_b)
            # Lab coat buttons & pen in pocket
            set_pixel(32, 38, 80, 80, 80)
            set_pixel(32, 45, 80, 80, 80)
            set_pixel(32, 52, 80, 80, 80)
            fill_rect(25, 36, 28, 41, 100, 100, 120) # Pocket
            set_pixel(26, 35, 220, 50, 50) # Red pen!
            
            # Arms holding chemistry flask or pointer
            fill_rect(15, 32, 21, 52, coat_r, coat_g, coat_b)
            fill_circle(18, 53, 3, skin_r, skin_g, skin_b)
            fill_rect(43, 32, 49, 52, coat_r, coat_g, coat_b)
            fill_circle(46, 53, 3, skin_r, skin_g, skin_b)
            # Flask in hand
            fill_circle(47, 57, 5, 120, 220, 255, 180)
            fill_rect(46, 52, 48, 55, 180, 220, 255)

            # Glasses
            fill_rect(25, 16, 29, 20, 50, 50, 50)
            fill_rect(26, 17, 28, 19, 200, 240, 255)
            fill_rect(35, 16, 39, 20, 50, 50, 50)
            fill_rect(36, 17, 38, 19, 200, 240, 255)
            fill_rect(29, 18, 35, 18, 50, 50, 50)

            # Stern mouth
            fill_rect(29, 26, 35, 27, 180, 50, 50)

            # Skirt & shoes
            fill_rect(24, 63, 40, 71, skirt_r, skirt_g, skirt_b)
            fill_rect(26, 72, 30, 75, 40, 30, 30)
            fill_rect(34, 72, 38, 75, 40, 30, 30)

    return pixels

def generate_wav(filename, sound_type="bell"):
    sample_rate = 44100
    if sound_type == "bell":
        # School bell: authentic rapid mechanical hammer ringing!
        duration = 2.5
        n_samples = int(duration * sample_rate)
        samples = []
        for i in range(n_samples):
            t = i / sample_rate
            # 16 Hz modulation for rapid clapper
            mod = 0.5 + 0.5 * math.sin(2 * math.pi * 18 * t)
            # Bell metallic harmonics
            tone = (
                0.5 * math.sin(2 * math.pi * 880 * t) +
                0.3 * math.sin(2 * math.pi * 1760 * t) +
                0.2 * math.sin(2 * math.pi * 2640 * t) +
                0.1 * math.sin(2 * math.pi * 700 * t)
            )
            # Envelope decay at the end
            env = 1.0 if t < 2.0 else max(0.0, 1.0 - (t - 2.0) / 0.5)
            val = int(tone * mod * env * 24000)
            val = max(-32767, min(32767, val))
            samples.append(val)
    else:
        # Scream / Krzyk: funny cartoon screeching shout!
        duration = 1.2
        n_samples = int(duration * sample_rate)
        samples = []
        for i in range(n_samples):
            t = i / sample_rate
            # Pitch rising then falling
            freq = 400 + 350 * math.sin(math.pi * t / duration) + 30 * math.sin(2 * math.pi * 60 * t)
            tone = (
                0.6 * math.sin(2 * math.pi * freq * t) +
                0.3 * math.sin(2 * math.pi * (freq * 1.5) * t) +
                0.2 * (math.sin(2 * math.pi * (freq * 2.2) * t))
            )
            # Loud burst envelope
            env = min(1.0, t * 15.0) * math.exp(-t * 1.5)
            val = int(tone * env * 28000)
            val = max(-32767, min(32767, val))
            samples.append(val)

    with wave.open(filename, 'wb') as wf:
        wf.setnchannels(1)
        wf.setsampwidth(2)
        wf.setframerate(sample_rate)
        wf.writeframes(struct.pack(f'<{len(samples)}h', *samples))

def main():
    target_dir = os.path.join("public", "assets")
    os.makedirs(target_dir, exist_ok=True)
    
    # 1. romanowski.png (Idle)
    print("Generating romanowski.png...")
    write_png(os.path.join(target_dir, "romanowski.png"), 64, 80, create_sprite("idle", False))
    
    # 2. romanowskiidzie.png (Walking)
    print("Generating romanowskiidzie.png...")
    write_png(os.path.join(target_dir, "romanowskiidzie.png"), 64, 80, create_sprite("walk", False))
    
    # 3. romanowskikrzyczy.png (Shouting)
    print("Generating romanowskikrzyczy.png...")
    write_png(os.path.join(target_dir, "romanowskikrzyczy.png"), 64, 80, create_sprite("shout", False))
    
    # 4. halbina.png (Teacher looking at class)
    print("Generating halbina.png...")
    write_png(os.path.join(target_dir, "halbina.png"), 64, 80, create_sprite("class", True))
    
    # 5. halbina_tyl.png (Teacher writing on board)
    print("Generating halbina_tyl.png...")
    write_png(os.path.join(target_dir, "halbina_tyl.png"), 64, 80, create_sprite("board", True))
    
    # 6. Audio files (both .wav and .mp3 named so both formats work seamlessly!)
    print("Generating dzwonek.mp3 & dzwonek.wav...")
    generate_wav(os.path.join(target_dir, "dzwonek.wav"), "bell")
    generate_wav(os.path.join(target_dir, "dzwonek.mp3"), "bell")
    
    print("Generating krzyk.mp3 & krzyk.wav...")
    generate_wav(os.path.join(target_dir, "krzyk.wav"), "scream")
    generate_wav(os.path.join(target_dir, "krzyk.mp3"), "scream")
    
    print("All assets successfully generated!")

if __name__ == "__main__":
    main()
