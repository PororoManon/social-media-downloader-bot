import puppeteer from 'puppeteer';
import * as cheerio from 'cheerio';

const BASE_URL = 'http://snapinsta.app/ru';

export const getPage = async (link: string) => {
    try {
        const browser = await puppeteer.launch({ headless: 'new', args: ['--no-sandbox', '--disable-setuid-sandbox'] });
        const page = await browser.newPage();

        await page.goto(BASE_URL, { waitUntil: 'domcontentloaded' });

        const input = await page.$('#url');
        await new Promise((ok) => setTimeout(ok, 500));

        await input?.type(link);
        await new Promise((ok) => setTimeout(ok, 500));

        await page.click('button[type="submit"]');
        await page.waitForSelector('.download-content', { timeout: 20_000 });

        const content = await page.content();

        await browser.close();
        return content;
    } catch (error) {
        if (error instanceof Error) throw new Error(error.message);
        throw new Error('Something went wrong, please try again');
    }
};

export const parseLinks = (page: string) => {
    const $ = cheerio.load(page);
    const links: Record<'type' | 'href', string>[] = [];

    $('[data-event="click_download_btn"]').each((_, a) => {
        console.log($(a).text());
        const link = $(a).attr('href');
        const type = $(a).text().split(' ')[1].toLowerCase();
        if (link) links.push({ type, href: link });
    });

    return links;
};
