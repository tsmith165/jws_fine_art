export async function POST(req) {
    try {
        const DISCOUNT_RATE = process.env.DISCOUNT_RATE || 0.0; 
        console.log("Returning discount rate: ", DISCOUNT_RATE);
        return Response.json({ discountRate: DISCOUNT_RATE });
    } catch (e) {
        console.log(`Error: ${e}`);
        return Response.json({ error: 'Unable to capture discount rate' }, { status: 500 }); 
    }
}
