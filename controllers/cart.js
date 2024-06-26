// controllers/CartController.js

const User = require('../models/User');
const Product = require('../models/Product');

const CartController = {


    showCart: async (req, res) => {
        try {

            const user = await User.findById(req.user._id).populate({
                path: 'cart.items.productId',
                model: 'Product',
                select: 'name price imageUrl', // Specify the fields you want to select



            });

            if (!user) {
                return res.redirect('/login?warning=Unauthorized: Please Log In');
            }

            const cartTotal = await user.calculateCartTotal();

            // if(cartTotal> 9999999){
            //   return  res.render('user/cart', {
            //         cart: user.cart, pageTitle: 'Cart', path: '/cart', cartTotal, message: 'Cart total exceeds maximum limit', messageType: 'error'
            //     })
            // }

            res.render('user/cart', {
                cart: user.cart, pageTitle: 'Cart', path: '/cart', cartTotal
            });

        } catch (error) {
            console.error('Error displaying cart:', error);
            // res.redirect(`/cart?warning=${error.message}`)
           res.redirect('/cart?warning=Error displaying cart');
        }
    },


    addToCart: (req, res) => {
        const productId = req.params.productId;
        const user = req.user; // Assuming you're using Passport for authentication

        // 1. Validate User and Product
        if (!req.user) {
            // return res.status(401).json({ message: "Unauthorized: Please Log In" });
            return res.redirect(`/login?warning=: Please Log In to add item to cart`);

        }

        Product.findById(productId)
            .then((product) => {
                if (!product) {
                    // return res.status(404).json({ message: "Product not found" });
                    return res.redirect('/shop?warning=Product not found');
                }

                const existingCartItem = user.cart.items.find(item => item.productId.equals(product._id));

                if (existingCartItem) {
                    // If the product is already in the cart, increment the quantity
                    existingCartItem.quantity += 1;
                } else {
                    // If the product is not in the cart, add it with a quantity of 1
                    user.cart.items.push({ productId: product._id, quantity: 1 });
                }

                return user.save();
            })
            .then(() => {
                // res.json({ message: 'Item added to cart successfully' });
                console.log('Item added to cart successfully');
               res.redirect('/cart?success=Item added to cart successfully')
            })
            .catch((error) => {
                console.error('Error adding item to cart:', error);
                res.redirect(`/cart?error=${error.message}`)
            });
    },


    postCartDeleteProduct: (req, res, next) => {
        console.log('postCartDeleteProduct()')

        const prodId = req.body.productId;
        req.user
            .removeFromcart(prodId)
            .then(result => {
                console.log('Product removed from cart');
                res.redirect('/cart?warning=Product removed from cart');
            })
            .catch(err => {
                console.log(err);
                res.redirect('/cart?error=Error removing product from cart');
            });

    }


};

module.exports = CartController;
