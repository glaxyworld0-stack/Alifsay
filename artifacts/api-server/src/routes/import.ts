import { Router, type IRouter } from "express";
import multer from "multer";
import csv from "csv-parser";
import fs from "node:fs";
import {
  db,
  productsTable,
  productVariationsTable,
  categoriesTable,
} from "@workspace/db";
import { eq, and } from "drizzle-orm";

const router: IRouter = Router();

const upload = multer({
  dest: "uploads/",
});


function slugify(text: string) {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}


async function getOrCreateCategory(path: string) {

  const parts = path
    .split(">")
    .map((x) => x.trim())
    .filter(Boolean);

  let parentId: number | null = null;


  for (const part of parts) {

    const existing = await db
      .select()
      .from(categoriesTable)
      .where(
        and(
          eq(categoriesTable.name, part),
          parentId !== null
            ? eq(categoriesTable.parentId, parentId)
            : eq(categoriesTable.parentId, null)
        )
      );


    if (existing.length) {

      parentId = existing[0].id;

    } else {

      const [created] = await db
        .insert(categoriesTable)
        .values({
          name: part,
          slug: slugify(part),
          parentId,
        })
        .returning();


      parentId = created.id;
    }
  }


  return parentId;
}



function parseAttributes(row: any) {

  const attributes: Record<string, string[]> = {};


  if (row["Attribute 1 Name"]) {

    attributes[row["Attribute 1 Name"]] =
      row["Attribute 1 Value(s)"]
        ?.split("|")
        .map((x: string) => x.trim()) || [];

  }


  if (row["Attribute 2 Name"]) {

    attributes[row["Attribute 2 Name"]] =
      row["Attribute 2 Value(s)"]
        ?.split("|")
        .map((x: string) => x.trim()) || [];

  }


  return attributes;
}



router.post(
  "/import/products",
  upload.single("file"),
  async (req, res) => {


    if (!req.file) {

      res.status(400).json({
        error: "CSV file required",
      });

      return;
    }



    const rows: any[] = [];


    fs.createReadStream(req.file.path)
      .pipe(csv())
      .on("data", (data) => rows.push(data))


      .on("end", async () => {


        let imported = 0;



        // پہلے Variable اور Simple Products import ہوں گے

        for (const row of rows) {


          if (row.Type === "variation") {
            continue;
          }



          const categoryId =
            row.Category
              ? await getOrCreateCategory(row.Category)
              : null;



          const attributes = parseAttributes(row);



          const [product] = await db
            .insert(productsTable)
            .values({

              name: row.Name,

              slug: slugify(row.Name),

              type: row.Type || "simple",

              description:
                row.Description || null,


              price:
                row["Regular Price"] || "0",


              salePrice:
                row["Sale Price"] || null,


              sku:
                row.SKU || null,


              categoryId,


              brand:
                row.Brand || null,


              images:
                row.Image
                  ? row.Image.split(",")
                  : [],


              attributes,


              sizes:
                attributes["Choose Your Size Here"] || [],


              colors:
                attributes.Color || [],


            })
            .returning();



          imported++;


        }



        // اب Variations import ہوں گی

        for (const row of rows) {


          if (row.Type !== "variation") {
            continue;
          }



          const parent = await db
            .select()
            .from(productsTable)
            .where(
              eq(
                productsTable.slug,
                slugify(row.Name)
              )
            );



          if (!parent.length) {
            continue;
          }



          const attributes = parseAttributes(row);



          await db
            .insert(productVariationsTable)
            .values({

              productId: parent[0].id,


              sku:
                row.SKU || null,


              price:
                row["Regular Price"]
                  ? row["Regular Price"]
                  : null,


              salePrice:
                row["Sale Price"]
                  ? row["Sale Price"]
                  : null,


              attributes,


              stockQuantity:
                row["Stock Quantity"]
                  ? Number(row["Stock Quantity"])
                  : null,


              inStock: true,

            });



          imported++;


        }



        fs.unlinkSync(req.file.path);



        res.json({

          success: true,

          imported,

        });


      });


  }
);



export default router;
