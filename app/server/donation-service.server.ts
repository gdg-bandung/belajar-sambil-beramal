const TOKEN = process.env.SUPABASE_TOKEN;
const BASE_URL = process.env.SUPABASE_URL;

export const donationService = {
    async getDonation() {
        try {
            const response = await fetch(BASE_URL + "functions/v1/registrations-sum", {
                headers: {
                    "Authorization": `Bearer ${TOKEN}`
                }
            });
            const { amount_sum } = await response.json();
            return amount_sum as number;
        } catch (err) {
            console.log("err", err);
            return 0;
        }
    }
}