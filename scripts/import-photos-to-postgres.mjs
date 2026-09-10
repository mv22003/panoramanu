import { readFile } from "node:fs/promises";
import { PrismaClient } from "@prisma/client";
import { loadEnvConfig } from "@next/env";

loadEnvConfig(process.cwd());
const prisma = new PrismaClient();
const csvPath = process.argv[2] || "data/photos_rows.csv";

function parseCsv(text) {
  const rows = [], row = [], lines = text.replace(/^\uFEFF/, "").split(/\r?\n/);
  for (const line of lines) { if (!line) continue; const values=[]; let value="", quoted=false;
    for (let i=0;i<line.length;i++) { const char=line[i]; if(char==='"' && line[i+1]==='"'){value+='"';i++;} else if(char==='"') quoted=!quoted; else if(char===','&&!quoted){values.push(value);value="";} else value+=char; } values.push(value); rows.push(values);
  }
  const headers=rows.shift(); return rows.map(values=>Object.fromEntries(headers.map((header,index)=>[header,values[index]??""])));
}

const rows = parseCsv(await readFile(csvPath, "utf8"));
for (const row of rows) {
  await prisma.photo.upsert({ where:{ id:row.id }, create:{ id:row.id, title:row.title, description:row.description, imageUrl:row.image_url, slideshowImageUrl:row.slideshow_image_url, instagramUrl:row.instagram_url, locationName:row.location_name, countryName:row.country_name, takenOn:row.taken_on ? new Date(`${row.taken_on}T00:00:00.000Z`) : null, lat:Number(row.lat), lng:Number(row.lng), createdAt:new Date(row.created_at) }, update:{ title:row.title, description:row.description, imageUrl:row.image_url, slideshowImageUrl:row.slideshow_image_url, instagramUrl:row.instagram_url, locationName:row.location_name, countryName:row.country_name, takenOn:row.taken_on ? new Date(`${row.taken_on}T00:00:00.000Z`) : null, lat:Number(row.lat), lng:Number(row.lng), createdAt:new Date(row.created_at) } });
  console.log(`IMPORTED ${row.id}`);
}
console.log(`Imported ${rows.length} photos from ${csvPath}.`);
await prisma.$disconnect();
