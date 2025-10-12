// Simple test to verify all issues are fixed
import { promises as fs } from 'fs';
import { join } from 'path';

const filesToCheck = [
  'app/(admin)/admin/add-promotions/aplicar/page.tsx',
  'app/(admin)/admin/update-products/[id]/page.tsx',
  'app/(client)/cart/layout.tsx'
];

async function checkFiles() {
  const rootDir = 'c:\\Users\\andre\\Documentos_local\\2025\\ecommerce';
  
  for (const file of filesToCheck) {
    const fullPath = join(rootDir, file);
    try {
      const content = await fs.readFile(fullPath, 'utf8');
      console.log(`✓ ${file} - File exists and is readable`);
      
      // Check for common issues
      if (content.includes('Package,')) {
        console.log(`❌ ${file} - Contains unused Package import`);
      }
      if (content.includes('X,')) {
        console.log(`❌ ${file} - Contains unused X import`);
      }
      if (content.includes('ArrowLeft,')) {
        console.log(`❌ ${file} - Contains unused ArrowLeft import`);
      }
      if (content.includes('any')) {
        console.log(`❌ ${file} - Contains any type`);
      }
      
    } catch (error) {
      console.log(`❌ ${file} - Error reading file: ${error.message}`);
    }
  }
}

checkFiles();
