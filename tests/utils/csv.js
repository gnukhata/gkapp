import * as fs from 'fs';
import { parse } from 'csv-parse/sync';

// Convert contents of a given CSV file to an array of JSON objets
function convertCsvToJson(filePath) {
  const csvFile = fs.readFileSync(filePath);
  const records = parse(csvFile, {
    columns: true,
    skip_empty_lines: true,
  });
  return records;
}

export default convertCsvToJson;
