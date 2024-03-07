const router = require("express").Router();
const { Product, Category, Tag, ProductTag } = require("../../models");

// The `/api/products` endpoint

// get all products
router.get("/", (req, res) => {
  // find all products
  // be sure to include its associated Category and Tag data
  Product.findAll({
    include: [
      {
        model: Category,
        attributes: ["category_name"],
      },
      {
        model: Tag,
        attributes: ["tag_name"],
      },
    ],
  })
    .then((products) => {
      res.json(products);
    })
    .catch((err) => {
      res.status(500).json(err);
    });
});

// get one product
router.get("/:id", (req, res) => {
  // find a single product by its `id`
  // be sure to include its associated Category and Tag data
  Product.findOne({
    where: {
      id: req.params.id,
    },
    include: [
      {
        model: Category,
        attributes: ["category_name"],
      },
      {
        model: Tag,
        attributes: ["tag_name"],
      },
    ],
  })
    .then((product) => {
      res.json(product);
    })
    .catch((err) => {
      res.status(500).json(err);
    });
});

// create new product
router.post("/", (req, res) => {
  /* req.body should look like this...
    {
      product_name: "Basketball",
      price: 200.00,
      stock: 3,
      tagIds: [1, 2, 3, 4]
    }
  */
  Product.create(req.body)
    .then((product) => {
      // if there's product tags, we need to create pairings to bulk create in the ProductTag model
      if (req.body.tagIds && req.body.tagIds.length) {
        const productTagIdArr = req.body.tagIds.map((tag_id) => {
          return {
            product_id: product.id,
            tag_id,
          };
        });
        return ProductTag.bulkCreate(productTagIdArr)
          .then(() => res.status(201).json(product))
          .catch((err) => {
            console.log(err);
            res.status(500).json(err);
          });
      }
      // if no product tags, just respond
      res.status(201).json(product);
    })
    .catch((err) => {
      console.log(err);
      res.status(500).json(err);
    });
});

// update product
router.put("/:id", (req, res) => {
  // update product data
  Product.update(req.body, {
    where: {
      id: req.params.id,
    },
  })
    .then((result) => {
      if (result[0] === 0) {
        return res.status(404).json({ message: "Product not found." });
      }
      if (req.body.tagIds && req.body.tagIds.length) {
        return ProductTag.destroy({
          where: { product_id: req.params.id },
        }).then(() => {
          const productTagIdArr = req.body.tagIds.map((tag_id) => {
            return {
              product_id: req.params.id,
              tag_id,
            };
          });
          return ProductTag.bulkCreate(productTagIdArr);
        });
      }
      res.status(200).json({ message: "Product updated successfully." });
    })
    .catch((err) => {
      console.log(err);
      res.status(500).json(err);
    });
});

// delete product
router.delete("/:id", (req, res) => {
  // delete a product by its `id` value
  Product.destroy({
    where: {
      id: req.params.id,
    },
  })
    .then((product) => {
      if (!product) {
        return res.status(404).json({ message: "Product not found." });
      }
      res.json({ message: "Product deleted successfully." });
    })
    .catch((err) => {
      console.log(err);
      res.status(500).json(err);
    });
});

module.exports = router;
