from selenium.webdriver.common.keys import Keys
from selenium import webdriver
from webdriver_manager.chrome import ChromeDriverManager
import time
import urllib.request
import json
import re

driver = webdriver.Chrome(ChromeDriverManager().install())
def main():
    login()
    open_products_panel()
    copy_products()

    time.sleep(30)

    driver.close()


def login():
    driver.get("https://app.site123.com/manager/wizard.php?w=3809992&from=dash")
    driver.find_element_by_id('username').send_keys('m.s.globalspam@gmail.com')
    driver.find_element_by_id('password').send_keys('MSglobal2020')
    driver.find_element_by_id('login-submit').click()


def open_products_panel():
    time.sleep(2)
    driver.implicitly_wait(3)
    driver.find_element_by_id('wizardTab4button').click()
    driver.find_element_by_xpath('//*[@id="card_112"]/div[2]/div[2]/div/div[2]/a').click()

def click_all_products():
    time.sleep(2)
    driver.switch_to.default_content()
    driver.find_element_by_xpath('//*[@id="moduleSideMenu"]/ul/li[3]').click() # click the all products button

def copy_products():

    products = []
    
    click_all_products()

    # change to product frame
    iframe = driver.find_element_by_id('moduleItemsIframe')
    driver.switch_to.frame(iframe)
    time.sleep(2)
    product_size = len(driver.find_elements_by_class_name('product'))
    
    # for debug
    start_index=0

    for i in range(start_index, product_size):


        try:
            iframe = driver.find_element_by_id('moduleItemsIframe')
            driver.switch_to.frame(iframe)
        except:
            pass

        time.sleep(2)
        prod = driver.find_elements_by_class_name('product')[i]
        prod.click()

        time.sleep(2)

        title = driver.find_element_by_id('title').get_attribute('value')
        description = driver.find_elements_by_name('description')[1].get_attribute('value')
        category = driver.find_element_by_xpath('//*[@id="existingCollections"]/span/div/button/span').text

        
        product = {'title': title,
                    'description':description,
                    'category':category}

        #print('----------------------------------------------------------')
        #print(i)
        #print('titile', title)
        #print('description', description)
        #print('category', category)
        #print('----------------------------------------------------------')

        image1 = None
        image2 = None
        try:
            image1 = driver.find_element_by_xpath('//*[@id="images_previewContainer"]/li[1]/a/img').get_attribute('src')
            image2 = driver.find_element_by_xpath('//*[@id="images_previewContainer"]/li[2]/a/img').get_attribute('src')
        except:
            pass

        t = re.sub('[^\w\-_\. ]', '_', title)
        if image1 != None:  
            image1_path = 'crowler/products/' +  t + '1.PNG'
            urllib.request.urlretrieve(image1, image1_path)
            product['image1'] = image1_path

        if image2 != None:
            image2_path =  'crowler/products/' + t + '2.PNG'
            urllib.request.urlretrieve(image2, image2_path)
            product['image2'] = image2_path

        driver.find_element_by_xpath('//*[@id="addModuleItemForm"]/div[1]/div/ul/li[2]/a').click() # click on more product options
        time.sleep(2)
        options = driver.find_elements_by_xpath('//div[starts-with(@id, "po-")]')
        for option in options:
            option_title = option.find_element_by_class_name("p-o-option-title")
            items = option.find_element_by_class_name("option-items-preview")
            product[option_title.text] = list(map(str.strip, items.text.split(',')))

        print('------------------------------------')
        print(i)
        print(product)
        print('------------------------------------')
        products.append(product)
        
        driver.switch_to.default_content()
        driver.find_element_by_xpath('//*[@id="moduleSideMenu"]/ul/li[3]').click() # click the all products button




    
    with open('outoutfile.json', 'w') as fout:
        json.dump(products, fout)
    

def print_all_fields(driver, element):
    attrs = driver.execute_script('var items = {}; for (index = 0; index < arguments[0].attributes.length; ++index) { items[arguments[0].attributes[index].name] = arguments[0].attributes[index].value }; return items;', element)
    print(attrs)

if __name__ == "__main__":
    main()