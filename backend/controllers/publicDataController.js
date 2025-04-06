const path = require('path');
const fs = require('fs');
const archiver = require('archiver');

/**
 * Controller for handling zip file downloads
 */
const downloadController = {
 
  downloadZip: async (req, res) => {
    try {
      const zipFileName = 'download.zip';
      const zipFilePath = path.join(__dirname, '../temp', zipFileName);
      
      
      const tempDir = path.join(__dirname, '../temp');
      if (!fs.existsSync(tempDir)) {
        fs.mkdirSync(tempDir, { recursive: true });
      }
      
    
      const output = fs.createWriteStream(zipFilePath);
      const archive = archiver('zip', {
        zlib: { level: 9 }
      });
      
      
      output.on('close', () => {
        console.log(`Archive created: ${archive.pointer()} total bytes`);
        
       
        res.setHeader('Content-Type', 'application/zip');
        res.setHeader('Content-Disposition', `attachment; filename=${zipFileName}`);
        
   
        res.download(zipFilePath, zipFileName, (err) => {
          if (err) {
            console.error('Error downloading file:', err);
          }
          
         
          fs.unlink(zipFilePath, (unlinkErr) => {
            if (unlinkErr) console.error('Error deleting temp file:', unlinkErr);
          });
        });
      });
      
     
      archive.on('warning', (err) => {
        if (err.code === 'ENOENT') {
          console.warn('Archive warning:', err);
        } else {
          throw err;
        }
      });
      
      archive.on('error', (err) => {
        throw err;
      });
      
    
      archive.pipe(output);
      
      // Add files to the archive
    
      
      // archive.file('path/to/file1.txt', { name: 'file1.txt' });
      // archive.file('path/to/file2.pdf', { name: 'documents/file2.pdf' });
      
      
      await archive.finalize();
      
    } catch (error) {
      console.error('Error creating zip file:', error);
      res.status(500).send('Error creating zip file');
    }
  }
};
