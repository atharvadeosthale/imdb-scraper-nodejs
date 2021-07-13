const { default: axios } = require("axios");
const express = require("express");
const app = express();
const PORT = process.env.PORT || 5000;
const cheerio = require("cheerio");

app.use(express.json());

app.get("/movie", async (req, res) => {
  try {
    const { id } = req.query;
    const response = await axios.get(`https://imdb.com/title/${id}`, {
      headers: {
        accept:
          "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.9",
        "accept-encoding": "gzip, deflate, br",
        "accept-language": "en-GB,en-US;q=0.9,en;q=0.8",
      },
    });
    console.log(response.data);
    const $ = cheerio.load(response.data);
    const title = $('h1[data-testid="hero-title-block__title"]').text();
    const summary = $("span[data-testid='plot-xl']").text();
    res.json({
      status: 200,
      message: "Data fetched successfully",
      data: {
        title,
        summary,
      },
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({
      status: 500,
      message: "Internal server error",
    });
  }
});

app.get("/search", async (req, res) => {
  try {
    const { query } = req.query;
    const response = await axios.get(
      `https://imdb.com/find?q=${query}&ref_=nv_sr_sm`,
      {
        headers: {
          accept:
            "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.9",
          "accept-encoding": "gzip, deflate, br",
          "accept-language": "en-GB,en-US;q=0.9,en;q=0.8",
        },
      }
    );
    const $ = cheerio.load(response.data);
    let results = [];
    const que = await $(
      "div.article > div.findSection > .findList > tbody .findResult .result_text > a"
    );
    // .each((result, index) => {
    //   results.push({
    //     name: index.text(),
    //     id: $(this).href,
    //   });
    // });

    que.toArray().forEach((result, index) => {
      results.push({
        name: result.children[0].data,
        link: `https://imdb.com${result.attribs.href}`,
      });
    });

    res.json({
      status: 200,
      message: "Search successful",
      results,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({
      status: 500,
      message: "Internal server error",
    });
  }
});

app.listen(PORT, () => console.log(`Server listening on port ${PORT}`));
