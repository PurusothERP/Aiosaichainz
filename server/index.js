import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 5001;
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb+srv://purusoth:Nifty101088@cluster0.ly4tctw.mongodb.net/aichainz_erp?retryWrites=true&w=majority';

app.use(cors());
app.use(express.json({ limit: '50mb' }));

// Mongoose Schema for Universal ERP State Storage
const ERPStateSchema = new mongoose.Schema({
  key: { type: String, required: true, unique: true, default: 'main_erp_state' },
  leads: { type: Array, default: [] },
  documents: { type: Array, default: [] },
  payments: { type: Array, default: [] },
  writeOffs: { type: Array, default: [] },
  receivableProvisions: { type: Array, default: [] },
  completedProjects: { type: Array, default: [] },
  projectPLRecords: { type: Array, default: [] },
  payables: { type: Array, default: [] },
  expenses: { type: Array, default: [] },
  ledger: { type: Array, default: [] },
  gstRecords: { type: Array, default: [] },
  employees: { type: Array, default: [] },
  attendance: { type: Array, default: [] },
  payroll: { type: Array, default: [] },
  amcContracts: { type: Array, default: [] },
  bankAccounts: { type: Array, default: [] },
  cryptoAccounts: { type: Array, default: [] },
  companyAssets: { type: Array, default: [] },
  eventRecords: { type: Array, default: [] },
  clientDocuments: { type: Array, default: [] },
  companyEMIs: { type: Array, default: [] },
  subscriptions: { type: Array, default: [] },
  serviceCategories: { type: Array, default: [] },
  expenseCategories: { type: Array, default: [] },
  reserveProvision: { type: Object, default: { reservePercentage: 15, reserveReason: "Future Expansion & Emergency Fund" } },
  lastUpdated: { type: Date, default: Date.now }
}, { timestamps: true });

const ERPState = mongoose.model('ERPState', ERPStateSchema);

// Connect to MongoDB Atlas
let isMongoConnected = false;
mongoose.connect(MONGODB_URI)
  .then(() => {
    isMongoConnected = true;
    console.log('✅ Connected to MongoDB Atlas successfully! Cluster: cluster0.ly4tctw.mongodb.net');
  })
  .catch(err => {
    console.warn('⚠️ MongoDB Atlas Connection Warning:', err.message);
  });

// API Endpoint 1: Health & Connection Status
app.get('/api/health', (req, res) => {
  res.json({
    status: 'online',
    mongoConnected: isMongoConnected,
    timestamp: new Date().toISOString()
  });
});

// API Endpoint 2: Get Full ERP State from MongoDB
app.get('/api/data', async (req, res) => {
  try {
    if (!isMongoConnected) {
      return res.status(503).json({ error: 'Database initializing or offline', fallbackLocal: true });
    }
    let state = await ERPState.findOne({ key: 'main_erp_state' });
    if (!state) {
      state = await ERPState.create({ key: 'main_erp_state' });
    }
    res.json(state);
  } catch (err) {
    console.error('Error fetching ERP state from Mongo:', err);
    res.status(500).json({ error: 'Failed to retrieve database state' });
  }
});

// API Endpoint 3: Sync & Save Full ERP State to MongoDB
app.post('/api/sync', async (req, res) => {
  try {
    const data = req.body;
    if (!data) return res.status(400).json({ error: 'No data provided' });

    if (!isMongoConnected) {
      return res.status(503).json({ error: 'Database offline' });
    }

    const updatedState = await ERPState.findOneAndUpdate(
      { key: 'main_erp_state' },
      {
        $set: {
          leads: data.leads || [],
          documents: data.documents || [],
          payments: data.payments || [],
          writeOffs: data.writeOffs || [],
          receivableProvisions: data.receivableProvisions || [],
          completedProjects: data.completedProjects || [],
          projectPLRecords: data.projectPLRecords || [],
          payables: data.payables || [],
          expenses: data.expenses || [],
          ledger: data.ledger || [],
          gstRecords: data.gstRecords || [],
          employees: data.employees || [],
          attendance: data.attendance || [],
          payroll: data.payroll || [],
          amcContracts: data.amcContracts || [],
          bankAccounts: data.bankAccounts || [],
          cryptoAccounts: data.cryptoAccounts || [],
          companyAssets: data.companyAssets || [],
          eventRecords: data.eventRecords || [],
          clientDocuments: data.clientDocuments || [],
          companyEMIs: data.companyEMIs || [],
          subscriptions: data.subscriptions || [],
          serviceCategories: data.serviceCategories || [],
          expenseCategories: data.expenseCategories || [],
          reserveProvision: data.reserveProvision || { reservePercentage: 15, reserveReason: "Future Expansion & Emergency Fund" },
          lastUpdated: new Date()
        }
      },
      { upsert: true, new: true }
    );

    res.json({ success: true, lastUpdated: updatedState.lastUpdated });
  } catch (err) {
    console.error('Error syncing ERP state to Mongo:', err);
    res.status(500).json({ error: 'Failed to persist state to MongoDB' });
  }
});

// Serve Vite Production Build Static Files
const distPath = path.join(__dirname, '../dist');
app.use(express.static(distPath));

app.get('*', (req, res) => {
  res.sendFile(path.join(distPath, 'index.html'));
});

app.listen(PORT, '127.0.0.1', () => {
  console.log(`🚀 Aichainz ERP Server running on http://127.0.0.1:${PORT}`);
});
