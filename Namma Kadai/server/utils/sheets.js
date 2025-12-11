const { google } = require('googleapis');

// Initialize Google Sheets API
const getGoogleSheetsClient = () => {
  try {
    const auth = new google.auth.JWT(
      process.env.GOOGLE_SHEETS_CLIENT_EMAIL,
      null,
      process.env.GOOGLE_SHEETS_PRIVATE_KEY?.replace(/\\n/g, '\n'),
      ['https://www.googleapis.com/auth/spreadsheets']
    );

    return google.sheets({ version: 'v4', auth });
  } catch (error) {
    console.error('Google Sheets client initialization error:', error);
    return null;
  }
};

// Sync customer data to Google Sheets
const syncCustomer = async (customer) => {
  const sheets = getGoogleSheetsClient();
  if (!sheets) return;

  const values = [[
    customer._id.toString(),
    customer.name,
    customer.phone,
    customer.email || '',
    customer.address || '',
    customer.model,
    new Date(customer.installedOn).toLocaleDateString(),
    customer.notes || '',
    new Date(customer.createdAt).toLocaleDateString()
  ]];

  await sheets.spreadsheets.values.append({
    spreadsheetId: process.env.GOOGLE_SPREADSHEET_ID,
    range: 'Customers!A:I',
    valueInputOption: 'RAW',
    requestBody: { values }
  });
};

// Sync service record to Google Sheets
const syncServiceRecord = async (data) => {
  const sheets = getGoogleSheetsClient();
  if (!sheets) return;

  const { customer, record } = data;

  const values = [[
    record._id.toString(),
    customer.name,
    customer.phone,
    customer.model,
    new Date(record.serviceDate).toLocaleDateString(),
    record.technician || '',
    record.partsReplaced.join(', '),
    new Date(record.nextServiceDate).toLocaleDateString(),
    record.priorityParts.map(p => `${p.part}: ${p.care}`).join('; '),
    record.notes || '',
    new Date(record.createdAt).toLocaleDateString()
  ]];

  await sheets.spreadsheets.values.append({
    spreadsheetId: process.env.GOOGLE_SPREADSHEET_ID,
    range: 'ServiceRecords!A:K',
    valueInputOption: 'RAW',
    requestBody: { values }
  });
};

// Main sync function
const syncToSheets = async (type, data) => {
  try {
    if (!process.env.GOOGLE_SPREADSHEET_ID || !process.env.GOOGLE_SHEETS_CLIENT_EMAIL) {
      console.log('Google Sheets not configured, skipping sync');
      return;
    }

    if (type === 'customer') {
      await syncCustomer(data);
      console.log('Customer synced to Google Sheets');
    } else if (type === 'service') {
      await syncServiceRecord(data);
      console.log('Service record synced to Google Sheets');
    }
  } catch (error) {
    console.error('Google Sheets sync error:', error.message);
    // Don't throw error - sync is non-critical
  }
};

module.exports = { syncToSheets };
