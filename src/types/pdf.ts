/**
 * Core type definitions for AuraPDF Studio
 */

export type ToolMode =
  | 'select'
  | 'hand'
  | 'crop'
  | 'image'
  | 'highlight'
  | 'draw'
  | 'text'
  | 'shape'
  | 'signature'
  | 'stamp'
  | 'redact'
  | 'eraser';

export type ShapeType = 'rectangle' | 'circle' | 'arrow' | 'line';

export type StampType =
  | 'APPROVED'
  | 'CONFIDENTIAL'
  | 'DRAFT'
  | 'FINAL'
  | 'PAID'
  | 'URGENT'
  | 'REVIEWED'
  | 'VOID';

export interface Point {
  x: number;
  y: number;
}

export interface CropRegion {
  x: number; // percentage 0..100
  y: number; // percentage 0..100
  width: number; // percentage 0..100
  height: number; // percentage 0..100
}

export interface Annotation {
  id: string;
  pageNumber: number; // 1-indexed
  type: ToolMode;
  x: number; // normalized percentage 0..100 or canvas px relative to page width
  y: number;
  width?: number;
  height?: number;
  points?: Point[]; // for draw/highlight
  strokeColor?: string;
  fillColor?: string;
  strokeWidth?: number;
  opacity?: number;
  text?: string;
  fontFamily?: string;
  fontSize?: number;
  fontColor?: string;
  isBold?: boolean;
  isItalic?: boolean;
  isUnderline?: boolean;
  isStrikethrough?: boolean;
  textAlign?: 'left' | 'center' | 'right' | 'justify';
  highlightBgColor?: string;
  bulletType?: 'none' | 'bullet' | 'number';
  boxStyle?: 'none' | 'callout' | 'quote' | 'clause';
  shapeType?: ShapeType;
  stampType?: StampType;
  signatureDataUrl?: string;
  imageDataUrl?: string;
  redactedText?: string;
  timestamp: number;
}

export type DeviceMode = 'laptop' | 'android';
export type ThemeMode = 'dark' | 'light';

export interface WordFormatting {
  fontFamily: string;
  fontSize: number;
  fontColor: string;
  isBold: boolean;
  isItalic: boolean;
  isUnderline: boolean;
  isStrikethrough: boolean;
  textAlign: 'left' | 'center' | 'right' | 'justify';
  highlightBgColor: string;
  bulletType: 'none' | 'bullet' | 'number';
}

export interface PageInfo {
  pageNumber: number;
  width: number;
  height: number;
  originalWidth?: number;
  originalHeight?: number;
  originalRotation: number;
  currentRotation: number; // 0, 90, 180, 270
  isDeleted?: boolean;
  orderIndex: number;
  crop?: CropRegion;
  backgroundColor?: string;
}

export interface WatermarkConfig {
  enabled: boolean;
  text: string;
  opacity: number;
  fontSize: number;
  rotation: number;
  color: string;
}

export interface PageNumberConfig {
  enabled: boolean;
  format: 'Page X of Y' | 'X of Y' | 'X' | 'Page X';
  position: 'bottom-center' | 'bottom-right' | 'bottom-left' | 'top-right' | 'top-center';
  fontSize: number;
  color: string;
}

export interface DocumentMetadata {
  name: string;
  sizeBytes: number;
  totalPages: number;
  lastModified?: number;
}

export interface SearchMatch {
  pageNumber: number;
  text: string;
  matchIndex: number;
  totalMatchesOnPage: number;
}
