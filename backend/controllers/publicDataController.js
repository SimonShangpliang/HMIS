// FILE: controllers/publicDataController.js
import path from 'path';
import fs from 'fs';
import archiver from 'archiver';
import { fileURLToPath } from 'url';
import { createObjectCsvWriter } from 'csv-writer';
import mongoose from 'mongoose';

// Import the correct models based on provided schemas
import { Consultation, Prescription } from '../models/consultation.js';
import Patient from '../models/patient.js';
import Diagnosis from '../models/diagnosis.js';
import Medicine from '../models/inventory.js';

// Get __dirname equivalent in ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/**
 * Controller for handling consultation data downloads
 */

export const getDiagonses = async (req, res) => {
  try {
    const diagnoses = await Diagnosis.find({}, '_id name diagnosis_id'); // only fetch needed fields

    res.status(200).json({
      message: 'Diagnoses fetched successfully',
      diseases: diagnoses
    });
  } catch (error) {
    console.error('Error fetching diagnoses:', error);
    res.status(500).json({ message: 'Failed to fetch diagnoses', error });
  }
};

export const downloadZip = async (req, res) => {
    console.log("Download request received with query:", req.query);
    const tempFilesToDelete = [];

    try {
      // Extract filter parameters from request
      const {diseaseId,diseaseName, startTime, endTime } = req.query;
      
      
      if (!diseaseId || !startTime || !endTime) {
        return res.status(400).json({ 
          message: 'Missing required parameters: disease, startTime, and endTime are required' 
        });
      }
      const tempDir = path.resolve(process.cwd(), 'temp');

      // Create temp directory if it doesn't exist
      if (!fs.existsSync(tempDir)) {
        fs.mkdirSync(tempDir, { recursive: true });
      }

      // Prepare file paths
      const zipFileName = `${diseaseName}-data-${new Date().getTime()}.zip`;
      res.setHeader('Content-Type', 'application/zip');
      res.setHeader('Content-Disposition', `attachment; filename="${zipFileName}"`);
      const archive = archiver('zip', { zlib: { level: 6 } });
      archive.pipe(res);  // ✅ Stream zip to client instead of saving
      // Handle errors and warnings
      archive.on('warning', (err) => {
        if (err.code === 'ENOENT') {
          console.warn('Archive warning:', err);
        } else {
          console.error('Archive warning:', err);
          throw err;
        }
      });

      archive.on('error', (err) => {
        console.error('Archive error:', err);
        res.status(500).send('Error creating zip file');
      });


      
      const consultations = await Consultation.find({
        diagnosis: diseaseId, // Array of diagnosis, so we search for the disease in it
        recordedAt: { $gte: new Date(startTime), $lte: new Date(endTime) }
      }).populate('patient_id').populate('prescription');

      console.log(`Found ${consultations.length} consultations matching the criteria`);

      if (consultations.length === 0) {
        // Create an info file if no consultations found
        const infoFilePath = path.join(tempDir, 'no-data.txt');
        fs.writeFileSync(
          infoFilePath, 
          `No consultations found for ${diseaseName} between ${startTime} and ${endTime}.`
        );
        tempFilesToDelete.push(infoFilePath);
        archive.file(infoFilePath, { name: 'no-data.txt' });
        await archive.finalize();
        return;
      }
      const allMedicines = await Medicine.find({}, '_id med_name').lean();
      const medicineMap = {};
      for (const med of allMedicines) {
        medicineMap[med._id.toString()] = med.med_name;
      }


      // Process each consultation
      for (const consultation of consultations) {
        const consultationId = consultation._id.toString();
        const patientId = consultation.patient_id._id.toString();
        const folderName = `consultation-${consultationId}`;
        // 1. Process reports (embedded in consultation)
        if (consultation.reports && consultation.reports.length > 0) {
          // Create a report folder
          const reportsFolderPath = `${folderName}/reports`;
          
          // Process each report
          consultation.reports.forEach((report, index) => {
            // Create a text file for each report
            const reportContent = `
              Report #${index + 1}
              Title: ${report.title || 'N/A'}
              Description: ${report.description || 'N/A'}
              Status: ${report.status || 'N/A'}
              Created At: ${report.createdAt ? new Date(report.createdAt).toISOString() : 'N/A'}
              Updated At: ${report.updatedAt ? new Date(report.updatedAt).toISOString() : 'N/A'}

              Report Content:
              ${report.reportText || 'No report content available'}
            `;
            
            archive.append(reportContent, { name: `${reportsFolderPath}/report-${index + 1}.txt` });
          });
        } else {
          // Create a placeholder if no reports exist
          const noReportsInfo = `No reports available for consultation ${consultationId}`;
          archive.append(noReportsInfo, { name: `${folderName}/reports/no-reports.txt` });
        }

        // 2. Create prescription CSV
        if (consultation.prescription && consultation.prescription.length > 0) {
          // Process each prescription
          for (const prescriptionId of consultation.prescription) {
            // Fetch the prescription details if not already populated
            let prescriptionData = prescriptionId;
            if (typeof prescriptionId === 'number') {
              prescriptionData = await Prescription.findById(prescriptionId);
              if (!prescriptionData) continue;
            }
            
            const prescriptionCsvPath = path.join(tempDir, `prescription-${prescriptionData._id}.csv`);
            
            if (prescriptionData.entries && prescriptionData.entries.length > 0) {
              const prescriptionCsvWriter = createObjectCsvWriter({
                path: prescriptionCsvPath,
                header: [
                  { id: 'med_name', title: 'Medicine Name' },
                  { id: 'dosage', title: 'Dosage' },
                  { id: 'frequency', title: 'Frequency' },
                  { id: 'duration', title: 'Duration' },
                  { id: 'quantity', title: 'Quantity' },
                  { id: 'dispensed_qty', title: 'Dispensed Quantity' }
                ]
              });

              const entriesWithMedName = prescriptionData.entries.map(entry => ({
                med_name: medicineMap[entry.medicine_id?.toString()] || 'Unknown',
                dosage: entry.dosage,
                frequency: entry.frequency,
                duration: entry.duration,
                quantity: entry.quantity,
                dispensed_qty: entry.dispensed_qty
              }));
              
              await prescriptionCsvWriter.writeRecords(entriesWithMedName);
              archive.file(prescriptionCsvPath, { name: `${folderName}/prescription-${prescriptionData._id}.csv` }); 
              tempFilesToDelete.push(prescriptionCsvPath);             
            } else {
              // Create empty prescription CSV if no entries
              const emptyPrescriptionContent = 'Medicine ID,Dosage,Frequency,Duration,Quantity,Dispensed Quantity\n';
              archive.append(emptyPrescriptionContent, { name: `${folderName}/prescription-${prescriptionData._id}.csv` });
            }
            
            // Add prescription metadata
            const prescriptionInfo = `
                Prescription #${prescriptionData._id}
                Date: ${prescriptionData.prescriptionDate ? new Date(prescriptionData.prescriptionDate).toISOString() : 'N/A'}
                Status: ${prescriptionData.status || 'N/A'}
            `;
            
            archive.append(prescriptionInfo, { name: `${folderName}/prescription-${prescriptionData._id}-info.txt` });
          }
        } else {
          // Create empty prescription CSV if no prescriptions
          const emptyPrescriptionContent = 'Medicine ID,Dosage,Frequency,Duration,Quantity,Dispensed Quantity\n';
          archive.append(emptyPrescriptionContent, { name: `${folderName}/prescription-none.csv` });
        }

        // 3. Create vitals CSV for the patient
        const patient = consultation.patient_id;
        
        if (patient && patient.vitals && patient.vitals.length > 0) {
          // Filter vitals by date range
          const filteredVitals = patient.vitals.filter(vital => {
            const vitalDate = vital.date ? new Date(vital.date) : null;
            if (!vitalDate) return false;
            
            return vitalDate >= new Date(startTime) && vitalDate <= new Date(endTime);
          });
          
          if (filteredVitals.length > 0) {
            const vitalsCsvPath = path.join(tempDir, `vitals-${patientId}.csv`);
            
            const vitalsCsvWriter = createObjectCsvWriter({
              path: vitalsCsvPath,
              header: [
                { id: 'date', title: 'Date' },
                { id: 'time', title: 'Time' },
                { id: 'bloodPressure', title: 'Blood Pressure' },
                { id: 'bodyTemp', title: 'Body Temperature' },
                { id: 'pulseRate', title: 'Pulse Rate' },
                { id: 'breathingRate', title: 'Breathing Rate' }
              ]
            });
            
            const vitalRecords = filteredVitals.map(vital => ({
              date: vital.date ? new Date(vital.date).toISOString().split('T')[0] : '',
              time: vital.time || '',
              bloodPressure: vital.bloodPressure || '',
              bodyTemp: vital.bodyTemp || '',
              pulseRate: vital.pulseRate || '',
              breathingRate: vital.breathingRate || ''
            }));
            
            await vitalsCsvWriter.writeRecords(vitalRecords);
            archive.file(vitalsCsvPath, { name: `${folderName}/vitals.csv` });
            tempFilesToDelete.push(vitalsCsvPath);
          } else {
            // Create empty vitals CSV if no matching vitals found
            const emptyVitalsContent = 'Date,Time,Blood Pressure,Body Temperature,Pulse Rate,Breathing Rate\n';
            archive.append(emptyVitalsContent, { name: `${folderName}/vitals.csv` });
          }
        } else {
          // Create empty vitals CSV if no vitals found
          const emptyVitalsContent = 'Date,Time,Blood Pressure,Body Temperature,Pulse Rate,Breathing Rate\n';
          archive.append(emptyVitalsContent, { name: `${folderName}/vitals.csv` });
        }
        
        
      }
      
      // Finalize the archive
      await archive.finalize();
      
    } catch (error) {
      console.error('Error creating zip file:', error);
      res.status(500).send('Error creating zip file: ' + error.message);
    } finally {
      tempFilesToDelete.forEach(filePath => {
        fs.promises.unlink(filePath).catch(err => 
          console.error(`Error deleting temp file: ${err}`)
        );
      });
    }
  };
