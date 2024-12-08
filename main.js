const apiPath = 'maxine';
const baseURL = 'https://livejs-api.hexschool.io/';

//取得產品列表
const productList = document.querySelector('.productWrap');

let products = [];
const getProductList = () => {
	axios
		.get(`${baseURL}api/livejs/v1/customer/${apiPath}/products`)
		.then((response) => {
			products = response.data.products;
			renderProductList();
		})
		.catch((error) => {
			console.log(error.response || '取得產品列表錯誤');
		});
};

//渲染產品列表
const renderProductList = () => {
	productList.innerHTML = products.map((item) => 
        `
        <li class='productCard' data-id='${item.id}'>
        <h4 class='productType'>新品</h4>
        <img
            src='${item.images}'
            alt='${item.title}'
        />
        <a class='addCardBtn'>加入購物車</a>
        <h3>${item.title}</h3>
        <del class='originPrice'>${item.origin_price}</del>
        <p class='nowPrice'>${item.price}</p>
    </li>`
	)
    .join('');
};

//取得購物車列表
let cartList = [];
const getCartList = async () => {
    try { 
        const response = await axios.get(`${baseURL}api/livejs/v1/customer/${apiPath}/carts`);
        cartList = response.data.carts;
        renderShoppingCart();
    }
    catch (error) {
        console.log(error.response || '取得購物車列表錯誤');
    }
};

//加入購物車
const addToCart = async (id, quantity) => {
    try {
        const response = await axios.post(`${baseURL}api/livejs/v1/customer/${apiPath}/carts`,
        {
            data: {
                productId: id,
                quantity: quantity,
            }
        });
        getCartList();
    }
    catch (error) {
        console.log(error.response || '加入購物車錯誤');
    }
};
productList.addEventListener('click', async function(event){
    if(event.target.classList.contains('addCardBtn')){
        const productId = event.target.closest('.productCard').dataset.id;
        const isAdded = await isInCart(productId);
        let newQuantity;
        if (isAdded) {
            newQuantity = cartList.filter(item => 
                productId === item.product.id
            )[0].quantity + 1;
            addToCart(productId, newQuantity);
        }else {
            addToCart(productId, 1);
        }
    }
})

//判斷購物車是否存在商品
const isInCart = async (id) => {
    await getCartList();
    let findProduct = false;
    cartList.forEach(item => 
        findProduct = item.product.id === id ? true : findProduct
    );
    return findProduct;
}

//渲染購物車列表
const shoppingCartTable = document.querySelector('.shoppingCart-table');
let discardAllBtn;
let discardProductBtns;
const renderShoppingCart = () => {
    let cartTableHeader = `<tr>
        <th width="40%">品項</th>
        <th width="15%">單價</th>
        <th width="15%">數量</th>
        <th width="15%">金額</th>
        <th width="15%"></th>
    </tr>`;
    str = cartList.map(item => 
        `<tr class="cardItem" data-cartid = ${item.id}>
            <td>
                <div class="cardItem-title">
                    <img
                        src="${item.product.images}"
                        alt="${item.product.title}"
                    />
                    <p>${item.product.title}</p>
                </div>
            </td>
            <td>${item.product.price}</td>
            <td>${item.quantity}</td>
            <td>${parseInt(item.product.price) * item.quantity}</td>
            <td class="discardBtn">
                <a class="material-icons"> clear </a>
            </td>
        </tr>`
    ).join('');

    let totalPrice = 0; 
    cartList.forEach((item) => {
        totalPrice += parseInt(item.product.price) * item.quantity;
    })
    let cartTableFooter = `
        <tr class="shoppingCart-overview">
            <td>
                <a class="discardAllBtn">刪除所有品項</a>
            </td>
            <td></td>
            <td></td>
            <td>
                <p>總金額</p>
            </td>
            <td>${totalPrice}</td>
        </tr>`
    ;
    shoppingCartTable.innerHTML = cartTableHeader + str + cartTableFooter;

    //重新宣告刪除商品按鈕及清空購物車按鈕
    discardAllBtn = document.querySelector('.discardAllBtn');
    discardProductBtns = document.querySelectorAll('.discardBtn');

    //監聽清空購物車事件
    discardAllBtn.addEventListener('click', async function(event){
        event.preventDefault();
        await discardAll();
        getCartList();
    }); 

    //監聽刪除商品事件
    discardProductBtns.forEach(btn => {
        btn.addEventListener('click', async(event)=> {
            event.preventDefault();
            const discardId = event.target.closest('.cardItem').dataset.cartid;
            await discardProduct(discardId);
            getCartList();
        })
    });
};

//清空購物車
const discardAll = async() => {
    try {
        const response = await axios.delete(`${baseURL}api/livejs/v1/customer/${apiPath}/carts`);
    }
    catch (error) {
        console.log(error.response.data.message || '清空購物車發生錯誤');
    }
};

//刪除購物車特定商品
const discardProduct = async(cartId) => {
    try {
        const response = await axios.delete(`${baseURL}api/livejs/v1/customer/${apiPath}/carts/${cartId}`);
    }
    catch (error) {
        console.log(error.response.data.message || '刪除購物車商品發生錯誤');
    }
};

const init = () => {
    getProductList();
    getCartList();
}
init();