import os
import struct
import zlib

def create_png_bytes(width, height, r, g, b, a=255):
    # PNG signature
    sig = b'\x89PNG\r\n\x1a\n'
    
    # IHDR chunk
    ihdr_data = struct.pack('>IIBBBBB', width, height, 8, 6, 0, 0, 0)
    ihdr_crc = zlib.crc32(b'IHDR' + ihdr_data)
    ihdr = struct.pack('>I', len(ihdr_data)) + b'IHDR' + ihdr_data + struct.pack('>I', ihdr_crc)
    
    # Raw uncompressed image data: each line has filter byte (0) + width * 4 bytes (RGBA)
    line = b'\x00' + struct.pack('BBBB', r, g, b, a) * width
    raw_data = line * height
    
    # IDAT chunk
    compressed = zlib.compress(raw_data)
    idat_crc = zlib.crc32(b'IDAT' + compressed)
    idat = struct.pack('>I', len(compressed)) + b'IDAT' + compressed + struct.pack('>I', idat_crc)
    
    # IEND chunk
    iend_crc = zlib.crc32(b'IEND')
    iend = struct.pack('>I', 0) + b'IEND' + struct.pack('>I', iend_crc)
    
    return sig + ihdr + idat + iend

def create_ico_from_png(png_bytes, width, height):
    # ICO Header: Reserved (2 bytes), Type 1=Icon (2 bytes), Image count (2 bytes)
    header = struct.pack('<HHH', 0, 1, 1)
    
    # Directory Entry: Width, Height, Colors, Reserved, Planes, BPP, Size of data, Offset
    # For 256x256, width/height byte is 0
    w_byte = width if width < 256 else 0
    h_byte = height if height < 256 else 0
    data_size = len(png_bytes)
    offset = 6 + 16  # header (6) + 1 entry (16)
    
    entry = struct.pack('<BBBBHHII', w_byte, h_byte, 0, 0, 1, 32, data_size, offset)
    return header + entry + png_bytes

def main():
    icons_dir = os.path.join(os.path.dirname(__file__), '..', 'launcher', 'src-tauri', 'icons')
    os.makedirs(icons_dir, exist_ok=True)
    
    # Cyan color: #00F0FF (0, 240, 255)
    png_32 = create_png_bytes(32, 32, 0, 240, 255)
    png_128 = create_png_bytes(128, 128, 0, 240, 255)
    png_256 = create_png_bytes(256, 256, 0, 240, 255)
    ico = create_ico_from_png(png_256, 256, 256)
    
    with open(os.path.join(icons_dir, '32x32.png'), 'wb') as f:
        f.write(png_32)
    with open(os.path.join(icons_dir, '128x128.png'), 'wb') as f:
        f.write(png_128)
    with open(os.path.join(icons_dir, '128x128@2x.png'), 'wb') as f:
        f.write(png_256)
    with open(os.path.join(icons_dir, 'icon.png'), 'wb') as f:
        f.write(png_256)
    with open(os.path.join(icons_dir, 'icon.ico'), 'wb') as f:
        f.write(ico)
    with open(os.path.join(icons_dir, 'icon.icns'), 'wb') as f:
        f.write(png_256) # placeholder for icns
        
    print(f"Generated icons in {icons_dir}")

if __name__ == '__main__':
    main()
