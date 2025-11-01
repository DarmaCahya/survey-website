/**
 * Script to backfill explanation data from JSON file to database
 * 
 * This script reads from jenis_data_dan_threats_with_explanations.json
 * and updates the threat_business_processes table with explanations.
 * 
 * Run this after migration to populate existing data:
 * 
 * node scripts/backfill-threat-explanations.js
 */

/* eslint-disable @typescript-eslint/no-require-imports */
const { PrismaClient } = require('@prisma/client');
const fs = require('fs');
const path = require('path');

const prisma = new PrismaClient();

async function backfillExplanations() {
  console.log('🔄 Starting explanation backfill...');
  
  try {
    // Read JSON file
    const jsonPath = path.join(process.cwd(), 'jenis_data_dan_threats_with_explanations.json');
    const jsonContent = fs.readFileSync(jsonPath, 'utf-8');
    const assetsData = JSON.parse(jsonContent);

    let updatedCount = 0;
    let skippedCount = 0;
    let errorCount = 0;

    for (const assetData of assetsData) {
      // Find asset by name (case-insensitive match)
      const asset = await prisma.asset.findFirst({
        where: {
          name: {
            equals: assetData['title-data'],
            mode: 'insensitive',
          },
        },
        include: {
          threats: true,
        },
      });

      if (!asset) {
        console.warn(`⚠️  Asset not found: ${assetData['title-data']}`);
        continue;
      }

      // Map threats by name
      const threatMap = new Map();
      for (const threat of asset.threats) {
        threatMap.set(threat.name.toLowerCase(), threat);
      }

      for (const threatData of assetData.threats) {
        const threat = threatMap.get(threatData.title.toLowerCase());
        
        if (!threat) {
          console.warn(`⚠️  Threat not found: ${threatData.title} (asset: ${assetData['title-data']})`);
          continue;
        }

        // Process business processes
        const bps = threatData.business_processes || [];
        
        for (const bp of bps) {
          const processName = (bp.name || '').trim();
          if (!processName) continue;

          try {
            // Find business process
            const businessProcess = await prisma.businessProcess.findFirst({
              where: {
                name: {
                  equals: processName,
                  mode: 'insensitive',
                },
              },
            });

            if (!businessProcess) {
              console.warn(`⚠️  Business process not found: ${processName}`);
              skippedCount++;
              continue;
            }

            // Find threat-business process relationship
            const tbp = await prisma.threatBusinessProcess.findUnique({
              where: {
                threatId_businessProcessId: {
                  threatId: threat.id,
                  businessProcessId: businessProcess.id,
                },
              },
            });

            if (!tbp) {
              console.warn(`⚠️  Relationship not found: threat ${threat.id} -> bp ${businessProcess.id}`);
              skippedCount++;
              continue;
            }

            // Update only if explanation is null or empty
            if (!tbp.explanation && bp.explanation) {
              await prisma.threatBusinessProcess.update({
                where: {
                  threatId_businessProcessId: {
                    threatId: threat.id,
                    businessProcessId: businessProcess.id,
                  },
                },
                data: {
                  explanation: bp.explanation,
                },
              });
              updatedCount++;
              console.log(`✅ Updated: ${threat.name} -> ${processName}`);
            } else if (tbp.explanation) {
              skippedCount++;
              console.log(`⏭️  Skipped (already has explanation): ${threat.name} -> ${processName}`);
            } else {
              skippedCount++;
              console.log(`⏭️  Skipped (no explanation in JSON): ${threat.name} -> ${processName}`);
            }
          } catch (error) {
            errorCount++;
            console.error(`❌ Error updating ${threat.name} -> ${processName}:`, error.message);
          }
        }
      }
    }

    console.log('\n📊 Backfill Summary:');
    console.log(`   ✅ Updated: ${updatedCount}`);
    console.log(`   ⏭️  Skipped: ${skippedCount}`);
    console.log(`   ❌ Errors: ${errorCount}`);
    console.log('✨ Backfill completed!');

  } catch (error) {
    console.error('❌ Backfill failed:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

// Run backfill
backfillExplanations()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });

