import { prisma } from "../../lib/prisma";

// eslint-disable-next-line import/no-anonymous-default-export
export default async function (req, res) {
  try {
    const passed_json = req.body;

    console.log(`Passed JSON (Next Line):`);
    console.log(passed_json);

    const theme = (passed_json['theme'] !== undefined) ? passed_json['theme'] : 'None';
    console.log(`Theme: ${theme}`)
    
    var pieces = null;
    if (theme !== 'None') {
      pieces = await prisma.piece.findMany({
        where: {
          theme: theme
        },
        orderBy: {
          o_id: 'desc',
        },
      });
    } else {
      pieces = await prisma.piece.findMany({orderBy: { o_id: 'desc' }})
    }


    res.status(200);
    res.json({ pieces });
  } catch(e) {
    res.status(500);
    res.json({ error: "Unable to fetch pieces" });
  } finally {
    //await prisma.$disconnect();
    console.log("End Pieces API Call");
    res.end();
  }
}
