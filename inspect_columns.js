import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://wialpeheyvjdsmfcwuvn.supabase.co';
const supabaseAnonKey = 'sb_publishable_FFqIxdyUYZ-PyPdFJaQnOQ_nQNzubG-';

const supabase = createClient(supabaseUrl, supabaseAnonKey);

const possibleColumns = [
  'id',
  'name',
  'city',
  'rating',
  'image_url',
  'image',
  'description',
  'about',
  'type',
  'distance',
  'address',
  'phone',
  'specialties',
  'services',
  'doctors',
  'slots',
  'created_at'
];

async function run() {
  let columnsToTry = [...possibleColumns];
  let successfulColumns = [];

  for (const col of possibleColumns) {
    const { error } = await supabase.from('hospitals').select(col).limit(1);
    if (!error) {
      successfulColumns.push(col);
    } else {
      console.log(`Column "${col}" is NOT present. Error code: ${error.code}, message: ${error.message}`);
    }
  }

  console.log('--- SCAN RESULTS ---');
  console.log('Existed Columns:', successfulColumns);
}

run();
