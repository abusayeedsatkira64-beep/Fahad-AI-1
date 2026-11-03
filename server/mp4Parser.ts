import fs from 'fs';
import { MP4BoxInfo } from '../src/types/optimizer.js';

const CONTAINER_BOXES = new Set(['moov', 'trak', 'mdia', 'minf', 'stbl', 'edts', 'dinf']);

const BOX_DESCRIPTIONS: Record<string, string> = {
  ftyp: 'File Type and Compatibility Brands',
  moov: 'Movie Resource (Metadata & Atom Index)',
  mvhd: 'Movie Header (Timescale & Duration)',
  trak: 'Track Container (Video / Audio track)',
  tkhd: 'Track Header (Resolution, Duration, Volume)',
  mdia: 'Media Container',
  mdhd: 'Media Header',
  hdlr: 'Handler Reference (Stream Type)',
  minf: 'Media Information Container',
  vmhd: 'Video Media Header',
  smhd: 'Sound Media Header',
  dinf: 'Data Information Box',
  dref: 'Data Reference Box',
  stbl: 'Sample Table Container (Timing & Offsets)',
  stsd: 'Sample Descriptions (Codec parameters)',
  stts: 'Time-to-Sample Table (Frame Timestamps)',
  stss: 'Sync Sample Table (Keyframes / I-Frames)',
  stsc: 'Sample-to-Chunk Table (Interleaving)',
  stsz: 'Sample Sizes (Byte count per frame)',
  stco: 'Chunk Offsets Table (32-bit Pointers)',
  co64: 'Chunk Offsets Table (64-bit Large Pointers)',
  mdat: 'Media Data (Raw Encoded Audio/Video Packets)',
  udta: 'User Data / Editing Software Metadata',
  free: 'Free Space / Padding Buffer',
  skip: 'Skip Space Buffer',
};

export interface MP4ParseResult {
  boxes: MP4BoxInfo[];
  moovPosition: 'front' | 'back' | 'unknown';
  moovOffset: number | null;
  mdatOffset: number | null;
  hasFaststart: boolean;
  boxSummary: string[];
}

export function parseMP4BoxesFromFile(filePath: string, maxDepth: number = 4): MP4ParseResult {
  const result: MP4ParseResult = {
    boxes: [],
    moovPosition: 'unknown',
    moovOffset: null,
    mdatOffset: null,
    hasFaststart: false,
    boxSummary: [],
  };

  if (!fs.existsSync(filePath)) {
    return result;
  }

  const stat = fs.statSync(filePath);
  const fileSize = stat.size;
  const fd = fs.openSync(filePath, 'r');

  try {
    function readBoxes(offset: number, length: number, currentDepth: number): MP4BoxInfo[] {
      const boxes: MP4BoxInfo[] = [];
      let currentOffset = offset;
      const endOffset = offset + length;
      const headerBuf = Buffer.alloc(16);

      while (currentOffset + 8 <= endOffset) {
        const bytesRead = fs.readSync(fd, headerBuf, 0, 16, currentOffset);
        if (bytesRead < 8) break;

        let boxSize = headerBuf.readUInt32BE(0);
        const boxType = headerBuf.toString('ascii', 4, 8);
        let headerSize = 8;

        if (boxSize === 1) {
          // 64-bit extended size
          if (bytesRead < 16) break;
          const high = headerBuf.readUInt32BE(8);
          const low = headerBuf.readUInt32BE(12);
          boxSize = high * 4294967296 + low;
          headerSize = 16;
        } else if (boxSize === 0) {
          // Extends to end of file
          boxSize = fileSize - currentOffset;
        }

        if (boxSize < headerSize || currentOffset + boxSize > fileSize + 1024) {
          // Corrupted or reached unparseable bytes
          break;
        }

        const boxInfo: MP4BoxInfo = {
          type: boxType,
          offset: currentOffset,
          size: boxSize,
          description: BOX_DESCRIPTIONS[boxType] || `MP4 Atom '${boxType}'`,
        };

        if (currentDepth === 0) {
          if (boxType === 'moov' && result.moovOffset === null) {
            result.moovOffset = currentOffset;
          }
          if (boxType === 'mdat' && result.mdatOffset === null) {
            result.mdatOffset = currentOffset;
          }
        }

        // Recurse into container boxes if within depth limit
        if (CONTAINER_BOXES.has(boxType) && currentDepth < maxDepth && boxSize > headerSize) {
          const contentOffset = currentOffset + headerSize;
          const contentLength = boxSize - headerSize;
          boxInfo.children = readBoxes(contentOffset, contentLength, currentDepth + 1);
        }

        boxes.push(boxInfo);
        currentOffset += boxSize;
      }

      return boxes;
    }

    result.boxes = readBoxes(0, fileSize, 0);

    if (result.moovOffset !== null && result.mdatOffset !== null) {
      if (result.moovOffset < result.mdatOffset) {
        result.moovPosition = 'front';
        result.hasFaststart = true;
      } else {
        result.moovPosition = 'back';
        result.hasFaststart = false;
      }
    }

    result.boxSummary = result.boxes.map(
      (b) => `${b.type.toUpperCase()} (offset: 0x${b.offset.toString(16)}, size: ${(b.size / 1024).toFixed(1)} KB)`
    );
  } catch (err) {
    console.error('Error parsing MP4 boxes:', err);
  } finally {
    fs.closeSync(fd);
  }

  return result;
}
