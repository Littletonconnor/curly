import { describe, expect, it, vi, beforeEach } from 'vitest'
import { parseFormField, isValidJson, getContentTypeFromExtension } from '../../../src/lib/utils/file'

describe('file utilities', () => {
  describe('parseFormField', () => {
    it('parses a simple text field', () => {
      const result = parseFormField('name=John')
      expect(result).toEqual({
        name: 'name',
        value: 'John',
        isFile: false,
      })
    })

    it('parses a text field with empty value', () => {
      const result = parseFormField('name=')
      expect(result).toEqual({
        name: 'name',
        value: '',
        isFile: false,
      })
    })

    it('parses a text field with equals sign in value', () => {
      const result = parseFormField('equation=a=b+c')
      expect(result).toEqual({
        name: 'equation',
        value: 'a=b+c',
        isFile: false,
      })
    })

    it('parses a file field with @ prefix', () => {
      const result = parseFormField('file=@photo.jpg')
      expect(result).toEqual({
        name: 'file',
        value: 'photo.jpg',
        isFile: true,
        filename: 'photo.jpg',
      })
    })

    it('parses a file field with path', () => {
      const result = parseFormField('upload=@/path/to/document.pdf')
      expect(result).toEqual({
        name: 'upload',
        value: '/path/to/document.pdf',
        isFile: true,
        filename: 'document.pdf',
      })
    })

    it('parses a file field with relative path', () => {
      const result = parseFormField('data=@./files/data.json')
      expect(result).toEqual({
        name: 'data',
        value: './files/data.json',
        isFile: true,
        filename: 'data.json',
      })
    })

    it('throws an error for invalid format without equals sign', () => {
      expect(() => parseFormField('invalid')).toThrow(
        'Invalid form field format: "invalid". Expected name=value or name=@file'
      )
    })

    it('handles field names with special characters', () => {
      const result = parseFormField('user-name=test')
      expect(result.name).toBe('user-name')
      expect(result.value).toBe('test')
    })

    it('handles values with spaces', () => {
      const result = parseFormField('message=Hello World')
      expect(result).toEqual({
        name: 'message',
        value: 'Hello World',
        isFile: false,
      })
    })

    it('does not treat @ in the middle of value as file', () => {
      const result = parseFormField('email=user@example.com')
      expect(result).toEqual({
        name: 'email',
        value: 'user@example.com',
        isFile: false,
      })
    })
  })

  describe('isValidJson', () => {
    it('returns true for valid JSON object', () => {
      expect(isValidJson('{"name": "John"}')).toBe(true)
    })

    it('returns true for valid JSON array', () => {
      expect(isValidJson('[1, 2, 3]')).toBe(true)
    })

    it('returns true for valid JSON string', () => {
      expect(isValidJson('"hello"')).toBe(true)
    })

    it('returns true for valid JSON number', () => {
      expect(isValidJson('42')).toBe(true)
    })

    it('returns true for valid JSON boolean', () => {
      expect(isValidJson('true')).toBe(true)
      expect(isValidJson('false')).toBe(true)
    })

    it('returns true for valid JSON null', () => {
      expect(isValidJson('null')).toBe(true)
    })

    it('returns false for invalid JSON', () => {
      expect(isValidJson('{invalid}')).toBe(false)
      expect(isValidJson("{'single': 'quotes'}")).toBe(false)
      expect(isValidJson('undefined')).toBe(false)
    })

    it('returns false for non-string input', () => {
      expect(isValidJson(null)).toBe(false)
      expect(isValidJson(undefined)).toBe(false)
      expect(isValidJson(123)).toBe(false)
      expect(isValidJson({ foo: 'bar' })).toBe(false)
      expect(isValidJson(['array'])).toBe(false)
    })

    it('returns false for empty string', () => {
      expect(isValidJson('')).toBe(false)
    })

    it('returns true for nested JSON', () => {
      expect(isValidJson('{"user": {"name": "John", "tags": [1, 2]}}')).toBe(true)
    })
  })

  describe('getContentTypeFromExtension', () => {
    describe('text formats', () => {
      it('returns application/json for .json files', () => {
        expect(getContentTypeFromExtension('data.json')).toBe('application/json')
      })

      it('returns application/xml for .xml files', () => {
        expect(getContentTypeFromExtension('config.xml')).toBe('application/xml')
      })

      it('returns text/plain for .txt files', () => {
        expect(getContentTypeFromExtension('readme.txt')).toBe('text/plain')
      })

      it('returns text/html for .html files', () => {
        expect(getContentTypeFromExtension('index.html')).toBe('text/html')
      })

      it('returns text/csv for .csv files', () => {
        expect(getContentTypeFromExtension('data.csv')).toBe('text/csv')
      })
    })

    describe('image formats', () => {
      it('returns image/jpeg for .jpg files', () => {
        expect(getContentTypeFromExtension('photo.jpg')).toBe('image/jpeg')
      })

      it('returns image/jpeg for .jpeg files', () => {
        expect(getContentTypeFromExtension('photo.jpeg')).toBe('image/jpeg')
      })

      it('returns image/png for .png files', () => {
        expect(getContentTypeFromExtension('icon.png')).toBe('image/png')
      })

      it('returns image/gif for .gif files', () => {
        expect(getContentTypeFromExtension('animation.gif')).toBe('image/gif')
      })

      it('returns image/webp for .webp files', () => {
        expect(getContentTypeFromExtension('image.webp')).toBe('image/webp')
      })

      it('returns image/svg+xml for .svg files', () => {
        expect(getContentTypeFromExtension('logo.svg')).toBe('image/svg+xml')
      })

      it('returns image/x-icon for .ico files', () => {
        expect(getContentTypeFromExtension('favicon.ico')).toBe('image/x-icon')
      })
    })

    describe('document formats', () => {
      it('returns application/pdf for .pdf files', () => {
        expect(getContentTypeFromExtension('document.pdf')).toBe('application/pdf')
      })

      it('returns application/msword for .doc files', () => {
        expect(getContentTypeFromExtension('letter.doc')).toBe('application/msword')
      })

      it('returns correct MIME type for .docx files', () => {
        expect(getContentTypeFromExtension('report.docx')).toBe(
          'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
        )
      })

      it('returns application/vnd.ms-excel for .xls files', () => {
        expect(getContentTypeFromExtension('spreadsheet.xls')).toBe('application/vnd.ms-excel')
      })

      it('returns correct MIME type for .xlsx files', () => {
        expect(getContentTypeFromExtension('data.xlsx')).toBe(
          'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
        )
      })
    })

    describe('archive formats', () => {
      it('returns application/zip for .zip files', () => {
        expect(getContentTypeFromExtension('archive.zip')).toBe('application/zip')
      })

      it('returns application/gzip for .gz files', () => {
        expect(getContentTypeFromExtension('backup.gz')).toBe('application/gzip')
      })

      it('returns application/x-tar for .tar files', () => {
        expect(getContentTypeFromExtension('package.tar')).toBe('application/x-tar')
      })
    })

    describe('media formats', () => {
      it('returns audio/mpeg for .mp3 files', () => {
        expect(getContentTypeFromExtension('song.mp3')).toBe('audio/mpeg')
      })

      it('returns video/mp4 for .mp4 files', () => {
        expect(getContentTypeFromExtension('video.mp4')).toBe('video/mp4')
      })

      it('returns video/webm for .webm files', () => {
        expect(getContentTypeFromExtension('clip.webm')).toBe('video/webm')
      })
    })

    describe('code formats', () => {
      it('returns application/javascript for .js files', () => {
        expect(getContentTypeFromExtension('app.js')).toBe('application/javascript')
      })

      it('returns text/css for .css files', () => {
        expect(getContentTypeFromExtension('styles.css')).toBe('text/css')
      })

      it('returns application/wasm for .wasm files', () => {
        expect(getContentTypeFromExtension('module.wasm')).toBe('application/wasm')
      })
    })

    describe('edge cases', () => {
      it('returns undefined for unknown extensions', () => {
        expect(getContentTypeFromExtension('file.xyz')).toBeUndefined()
        expect(getContentTypeFromExtension('file.unknown')).toBeUndefined()
      })

      it('handles uppercase extensions', () => {
        expect(getContentTypeFromExtension('FILE.JSON')).toBe('application/json')
        expect(getContentTypeFromExtension('PHOTO.PNG')).toBe('image/png')
      })

      it('handles mixed case extensions', () => {
        expect(getContentTypeFromExtension('data.Json')).toBe('application/json')
      })

      it('handles files with multiple dots', () => {
        expect(getContentTypeFromExtension('archive.tar.gz')).toBe('application/gzip')
        expect(getContentTypeFromExtension('file.backup.json')).toBe('application/json')
      })

      it('handles files with no extension', () => {
        expect(getContentTypeFromExtension('Makefile')).toBeUndefined()
      })

      it('handles paths with directories', () => {
        expect(getContentTypeFromExtension('/path/to/file.json')).toBe('application/json')
        expect(getContentTypeFromExtension('./relative/image.png')).toBe('image/png')
      })
    })
  })
})
