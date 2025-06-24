import express from 'express';
import { ENV } from "./config/env.js";
import { db } from "./config/db.js";
import { favoritesTable } from './db/schema.js';
import { eq, and } from 'drizzle-orm';


const app = express();
const PORT = ENV.PORT;

app.use(express.json());
app.get('/api/health', (req, res) => {
    res.status(200).json({ status: 'OK' });
});

app.post('/api/favorites', async (req, res) => {
    try {
        const { userId, recipeId, title, image, cookTime, servings } = req.body;
        if (!userId || !recipeId || !title || !image || !cookTime || !servings) {
            return res.status(400).json({ error: 'Missing required fields' });
        }

        const newFavorite = await db.insert(favoritesTable).values({
            userId,
            recipeId,
            title,
            image,
            cookTime,
            servings,
        }).returning();

        res.status(201).json(newFavorite[0]);
    } catch (error) {
        console.error('Error creating favorite:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

app.get('/api/favorites/:userId', async (req, res) => {
    const { userId } = req.params;
    try {
        const userFavorites = await db.select().from(favoritesTable).where(eq(favoritesTable.userId, userId));
        res.status(200).json(userFavorites);
    } catch (error) {
        console.error('Error fetching favorites:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

app.delete('/api/favorites/:userId/:recipeId', async (req, res) => {
    const { userId, recipeId } = req.params;
    try {
        const deletedFavorite = await db
            .delete(favoritesTable)
            .where(
                and(eq(favoritesTable.userId, userId), eq(favoritesTable.recipeId, parseInt(recipeId))),
            );
        res.status(200).json({ message: 'Favourite removed succesfully', deleted: deletedFavorite });
    } catch (error) {
        console.error('Error deleting favorite:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});