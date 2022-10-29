

var webgl = {


  polys: [],
  points: [],
  pointColors: [],
  pointNormals: [],
  texCoords: [],
  pointsizes: [],
  lines: [],
  dots: [],

  texture: null,
  imageURLs: [
    "https://hl-grocery-prod-master.imgix.net/products/166a271a70f56dd7bc071d47f7c8fedd10bda460?fill=solid&fit=fill&fm=jpg&h=256&pad=7&q=92&trim=auto&trim-md=0&w=256",
    "data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wCEAAoHCBYVFRUVFRYZGBUYFRgYFRUcGBUZGBUYGBgZGRgYGBocIS4lHB4rIRgYJjgmKy8xNTU1GiQ7QDszPy40NTEBDAwMEA8QHhISHzErJCs0NDQ0NDQxNDE0NDQ0NDQ0NDQ0NDQ0NDQxNDQ0NDE0MTQxNDQ/NDQ0Pz8xPzE0NDExMf/AABEIAOEA4QMBIgACEQEDEQH/xAAbAAABBQEBAAAAAAAAAAAAAAAEAAECAwUGB//EADkQAAEDAgQDBwIGAQQCAwAAAAEAAhEDIQQSMUEFUWEGEyJxgZGhMrEUQlLB0fAVYnKS8TPhI1Oi/8QAGQEAAwEBAQAAAAAAAAAAAAAAAQIDAAQF/8QAJhEAAwACAgEEAgIDAAAAAAAAAAECERIDITEEE0FRImEUMiNSof/aAAwDAQACEQMRAD8A5vBCTK02FB4KnDQjWhScMbZEpSlKEgEulG2REFJSyJwxFRRtkQKcKZYUgwo6V9G2RBJWd2VLu1ta+jbIpSVvdlP3S2j+jbIqBTwrAxPkR0r6BsvsHriyzao1WxUpyEG/CElV45a8k7aZztdt1BwW2/hpKrfwcpah5KTaSMOVW9y2TwVyYcDcUNGF3JkNUahW6zghTP4EVtGK7RzpKsprZPASpU+COCzihVSyZLlWt93Biqv8KVtKGVrJjBWtWmOClWjgxR0oLuTJlJav+HKS2jF3RsMpq9jbI/uAkaHJUXJLFfFS+TPhSyo9mElXtwQTbSTcszWNlTdThH/g1P8ADSFtkbDM0BPlR/4JSbgAjsjaszrJStMcPCmOHBDZG1ZlthWAArROBaEhhGhB2kNMtmS5iaFsHDBN+Fal91D+yzJDU4p9FqHDBSyBb3kD2mZeTopMYtE0wommFnzB9l/YA6n0TBvRarGNUXsGy3u/oHtfsy8vRSDEaaQUm0QmmxKnABk6JwxaDqYUe7COwNTNfTVZZ0WqaQUDSCyszkzcvRPl6I40uiWTojsbUAyFJHZQktsbUIZhSpGlCuDyoulc05+S9NEO7KeCnhOWlP0IRuoh6sylV92VujErpQ5Ta0qtzzMIZz4DhIRrEapnYgqWSdU3cBP48gK+9Kkx91MYcJd0s1LNloNZRBGqk3DhCU3EKWd3NLqg7sKfhxGqAeyCrjm5qp1Myg4WDTbyQczqllUnMQ0mUFLHdEniN1Nj1AtlOKaokSbHc5IP6pd2myLdC9l9MAqzu280O1h/spFp/spXgfP6LajBsrMK1u6GKbMdlkjZRtMw7DyTVcIwrJo4twN0d+IndHJumN+Aaknz9UkMmwSa5sS5oHlBTFjSJAkeoUaVATc7wBAWizw3sfP/ANLypq0vLPRqI+gOlhARJaWj/e137ItvCWnR5HmB/KRF5FhraLItjHZcxLdJG0+qvHLRGuOfgAfwd+xB5ahVVOGVG/lnyW0wyLED7g9QVFhdfM+eSt7uCftIwjhHjVh9ih6tA/pPsV0mIxJY2degFz5IB+PqR9GukwlfqUjLgb+TGbyKfMFs1Q8tDnZR0LZ10mSg6mGluYtAMx4RA84R/lT8pmfC8dMENRM16sOG/hVmmZXVNxSyiFTUvDGc9MHKXdp2W2R2kXVjCooF5V4AOyt7kRJsP7oldyvI8w34AyU7cK52jUTTpmQ5ot5ST5IzD4psxYcydfJQv1OP6lZ4c+QNnC3alzfkq5nDR+Z/sEa/EMF5j1TVXS2Rp5fKk+emMuGUVU8LRHU7Sf4RVOjS/QPlVsogdTqDa/RNnJuLTzCzuhtJCmsB+mPKfurHUQQbBx5GIQtIk6n1O/rurmwCSCRAnWw9UnbD0VCkyL02dIn7od+BY78kc8rtPdaQrgwIDuT7HXy1VVejrlJjojtS8M2svyjKq8GFy19tg4R8hBDhdWfBld0DrrbDL6+QOqdoIl4YA617CR1KM+prwwPhn4MT8HX/AEH3SXTd8/kP+SdP/IYvsoAw7SDD3D6ZExM8piVZUpsb4gdvfyVeKxQY52kWuIIk7ROqz6OMIM3LATlGvWwAXNVLODomW+zbo1GtI0kiddtUqj2k2MHmLe6wcRxFwaQRc6CdfTbyVVHGvcZy5bQHa+4WfIksB9p+TeZDul/MKOJq5Ya0DMeRNvMLMpsLruJcdyYGXyAWngoFpl1j5oKnXXg1Tr2NhiRdwv8AZRZxB73WAyTbcn1RjqLTmabgi42GyHwnDstgIA0GwCsoa8EHeSwtOnO8m8XUu7ABbry6J3U5iSbTpup0WmNEyWRNn8GXxCnEAG4i0TIQ4phaD+FucSS7X4Um8NPNGFq39Bp7JGdACbM3otP/ABnMrn+KVmeNjTOQwSNJ3VHQsxkhiOJtDoY3NGrtrawqXcQJDhGmk28vshqj2xDAc/5naSP4TUGluYwH7AEnlqFy23T7OuISRq4PiBYJ+o2nfLKfEVcxzAH9p5+az6FYMdJAMtiORWg+oHZXPPKYi3QKWWHXDKs7pl0ukWvY7QtHC1MwEuhu8aj+UGxjnOcxupkidr7oSox4LswtJAjp5LJ4eQucmtjcWWsY1gBDnEEQZImwB2V4qZG3dYXJO3l0WbQcSR4YInXUSNbqT3wIM6RBNr6/dH3EDQ0qdbNdtxzn00RIaG3Lrxcc1l0MR3chpMncnQKQq/mebEwnm0I4YTj8S9lwbAdI9kCziT94grQdiWBkwAI81jPyvccvpaB1Rf2GfoNbXLtDBnXVJ9WpfxW0Mxsh8OxzdtN5+ykHucenVSp94RTCId8eR906fuXckkOzYRXiWOc5xebSZN9fJEU3tY0QAY0NtN9Ewqhwjkfqg38lQ4xLQOmoAny9kOpy0Fd9DOOYhxaCdjElFtaIFtbkIGjyM6ndHYZrpnNmIHNRm/JRoJpkDkCeS0aGGAvMu89EJhaRd4jM8rfKmyu4uJ0bJE7EDddXDL8s5eWvhBjaXiLtLX6q57iAIVVN1tVOnh3O0MDykny5LrSycwHiarpDG6m5J0Hl1R2HpODQXe+6Iw2BYzrGiJLS4EHrp52+FSYA2CGEgWpNATylaGTIPFjGsGOh/sLzvFcExFFoqPI+vxlpmJvJXo0qqpDgQRIOoNwUlTldMeaaZ5sCHEWAIA+okSPNXOxRaYDRGnPXUgrsKnAsOTOSNbAmFynaDFYbDOgPc9/6BENHUhc9JouuSStvhiAD5nXcxKLw7zkB0cJiPiP5XPM7V4f8xe0nmwx1Mt1RLe0eGIhlZs/6g9o9yICk1S+CqqX8nQVqgc9z88aaamR/2ose15a0CzdXneLmOpQDXhzGvDgWkWLYOYehUcA+S+SZDSR1vH7pXazgKnrJpYJ2fO52kjlHqFbXAzABvhtf++qymYnLlaNrGSee4K0jjDAa6BG9uSb8WhWmmWNBhwaDJsBH1IOmS4hptfTkRqQtFlYECwDhOW5vbVUM/wBXKAY0vP8APui0gJsn+ENgHQCTExdOyjk8RdeTe0Cwt1RFOscsAEuIAmNANRCtdSljpaJkxJPhIAEqiS+GI215I0XWJJBnQWlJrGtALxaZhU4PCOkS4WureIskg7TIPT+hTp4WRku8E/xtP9LvZJU5mc0knvIPt/spdW8P0gTsIn0Wf3rgIixMnnK6OpwcEWJBCzq3An3h4I+UnJwcy+MgjnhgYEQJHiEk7g8loYOjEzfNugf8VVFgNNDsjeHUKjTlcDPwoxx8m2Gh75I16Zp0mAAwdto+VbhqdiXC+m8RNvVX4LAhouLz5otlOx11svZ441ns8+qyymlht9uSNY3+hC0MW1z8jTLmiXNAkNnQFwsDrZGCytOvwKMRyTOcoVq4bdxAHOw+6yMZ2jwzAc1Zmb9IcCfYI5SA1gOzXMJ4XJV+OkuFQeFsjIDuOq6DhvERWbmALSNQf2XM+SXWo0Un0GELIx3HKVPMDLoFsomTyQ/FMYX1TQD8kNaYkjPOu3wub4phO7kB3hgu16j+VLk5WvA15mchPFe0VVwhjCxhH1S3TqSVxmJqlxMw6Dr59UZiX1JiJbIJJGw1F1Go/OcrWWsAINrXUnapdLshmqZy+Iwz3H6JBsLiVQ7DFpgtgiJDgf2XRY/EGkG5WN5OmZCMw1Jr2h1XcSGiYHmd0z5Kldo6uJVXwB4DjWRgYaQAG7HQUTT7QMaScj7gjbQqT+G0WjxOi+mtjog8Rw4ts0E6eIEadAVFVFPLO9Ski6p2iYXAkOjq0yPXdbWBxzKkOY4P367GHArkTh3NJzNmP9JuP5W12LIbWNMwc4JbIg5mjQhVXHD8MjXNq8YOqZiXnUQNrJPxMmHE/wAQuioYNjmgObeNdENiuAiCWGRGm/opVwck9+UGeaW+wChjQBc39FazFAmxPOCkeHODJIGXexBVBwxbcN2ERf36LnquSOmh9ooO1uHRPWOkJ2GBBvOl50QWRx2+ZSLHzJlQfqHQylBOU/0J0P3juqS25tUcS7tzj7AZbdFF3bPHH6gPRzh+yyv8wHa0gLT9QVVXjH6GAn/dp8L1tuR9Y/6eNpecYNhvbHGME+EA88zgisP2/wAX+bJ0hplcqeM1c0FrTPSR7K+nxF5mGtEXMMCb8kik8HJR3PDu1+NcZIYGk6uBEexutjFdqiRlL5MXDLSf2C8xoYp7zEknlMLZwuCqkw1kddlzc18j6ydfH6aZ75GdDhuI1m5stTI1xzEMAn1dqVTi+I1L/wDzv/5OTUOCVCJc8N5QCf4UKnCmNfD3yA6HCImevmpf5Ou8I6Hy+mhddmRiauIrgsY6o8DWXEgealguzNZl+6LjrNoldZgMLQY1xZAbPiM2+VRie1OHpnK0ue7SGCR7my6JdJYZwcnJXLXU9fQLw/hNRxiuC0A/TMT5LsOz7A1jg3RYjnuqMD3Sy2bIAJA6uK0uANEZmudG7TcE/sm4k1WcAmWvgw+12dmJbUb+kEdYWVWxhqtIfflOoP8AC7jjWBZXZlNnC7XRoeR6Lg8Tg30nGQeXTzTc8Pyjq4nNLWgvA0WPgPkGwuTAW1RwNKCA712CwaL2ne4/vNaWGDRBzSOvNcM8tQ8YHfp4x0T4j2abVYQ0gugw63yudxXAMRTALm5gNMpkmSdAuvpHLo5RPFDJaBMaGfuq1zy1+QIipf4nBV8RGZrmkXtmBB16qGGxBBOV17R6c+i7vFZaohzATpJ2QmJ7LUXtkS0xMtib9EOOottSWfI5/sjl6nE8xLg0C3i3nnAQdCXvDg7K4XaR4TI6o3H9mq1OS05xF5hpgfdYrcU9rhYR639VdQ58CZmj07hfaqkQGVAWOGUZicwcdCZAtzXU0qwIBBBGoIMyvEnY9tw4EfurMLjnBzSKjmCYgOcPK06KsctJfkiHLwz5lntuJquLHZGtL48IcYaT1IQjMAS0F0BxHjyzlnpN4XmjO1uIpuAa/O205hNvOxK2afbV4Nw12mkjzW5LisbI5tnPno6HFYAslweGjrYD1Q1Rr2jxN9R4gQgn9qGVmOY+i9zSIcBlg+5BTjtgJaxmGqahrScgHIbyuR+l4qX4vDKx6hofvn9PZJbmd36B/wAmJKf8F/7Fv5J4biajSADfoNlQ7NAIacugIaTPQRqvUn9n8C+zqLRvmBIP3Wlw/hdCk1gYW5Wk5QQJ3Xfx8vE15F5Nl4R47gvG+4ykGL285BWtUpgGwsTB6ld5xPsjRr1DVb4C4y4tIlx0O1lnVOwtS7W1AW6tIGhn83WJWvDr8WPHIlP5eTG4XhmF5kCQJhG1KcSWuLI5EhGs7HVGZnh5c4gANsDMiSSdlr8L7JDOKld+Zgv3Z2O2Y7rmfBbrp9FPe49eznaXFarBDKhc7k6HDyKq4rxipUZleGDMBJY0yQNrnotztpwymyoxzQfG0kgCGNDQBIyrkazw0kN8ROnQcyjScvUMzxUtsD4DBVKsMbmynq7LIF5XU4HgDabpcMxBhvQ7WS7O1Q2kAQQ4TJ0k8x0NkfhTVeCCZBdIJAIjYJ+k+ydP4XQsbiKjXhrS0iBDANY1JWzwsFrPEIJMxyVODwLWnMbuOrjc+Q5BaLaYCbjznLErGMA+Krcly/Fy98iPaZXWVWTshX4UHb7prdAlJHnVSnWaZa4kcnNBH8pxj6jfqZ0lpJHtqPld6/hw5fBQ1ThQOjSpNr5RVV+zlsJxaQWkn3iZ80fRhwlrh5g7o93Z5jvqtytKz8R2cyS6m9wdsGiAfMaJHxRXwMuRosfUcBMmRaeauwvFHt3usas+s2GvHmRAnrClQqyWy4R1P3UK9PrWYKq5pdmxisWXfULH6oWHiaBfIAEEGJi08lp1RA1B9ULga8zIHTqkfuQ85GmZa8DcN7O0H+F5JeWxrYdfNSxPYltu7eQ69yAQr8JQDHueSTLpjYBaH4x2YEkxtKsvVVKw1n9kK4e8pnIU+EVGVS1+2pgwZ5Stijgmi+p/ui0eI4qepGh1ieSFY8nwt99ikrmVvo5Ob09t5GdVZTBL3R0srezvEKVSu1oMWJaTpMILE9mn1T9bSP06Eb25lZWO4JVo3aHEDTn7hdXDKxnJB8Tnyemf5PD/AKwkvKcjv/pd/wDpJXybP6O0ebkC9rEXOs7K9gJykX5f+1VW7Nlv0FzY5OMDyGgQ7cJiWHwvJ/3NB+0Lkr0stnprl6NRrj9OYX2mD1V+CqO7xuY+EdbeixDVqAgvYCR+ZpIPqCERS4kywex7CObZHu3RTfp3LymZ0mju2gQSdNkNXeALGxv7rMwvGGPaCHtt9XjaAPOTZRxFXvYFM2kEkEx7xC9D3cycftvJTx9zxQLGZJLcl7uyuIktOxsuPwHDnipD6WcQWh5zE/OoXe4bhxmXmXbHkjW4XoPlJ3SHmlPRzmB4K1o0BFoadGx6rZpYSBoB7I5tCLR7KYodfdNMCuslNOn0HwiWsSayOXsnI8vhVmUhG2yD28vsqiw9fdEFo5hMI2SuchTB+68/cqBp/wDRlF5RzPumc3r90NEHIA+lO3woGgOUeyPyjr7Ju7H9CGgdjJq4VrrFoPss3FcDY+ZaAumczoolk7fZDQZWcDiOzUE5CR0zH7aLLr8PrsJiCPL+F6VVoHlHqhX4Unb11Uaj7RWeR/ZwdPiJYA17HQBc2InmjhjGPENgvjQWJ9Ddb7+GTMtELLxXZ8G0D20SfjjDQ2785MxtYaOt0KtpVwCIiVDE9n6gNnuPKSSPYoSrgqzNgfQhctcHf4suuVPydFh6gOlnc1b3jtDcbg3+65qhiS362ub1iR8XWvh8Q14EOzDQkEGPO9vJCeK0CnDC/D+gf31SSzjl8FMn05PsXWPoNw/aRj3QJI5giVsUCyoJY6efMea5evwfDBsseQ7aClwSs/DvzuDi2CHDWRsV698aR583k6Z+BlUP4VK0MLxWjU0dB5OEH5RzHNOhB9lNzkbZmJhuCUwczmyRoSNFqsoAaC3kiYCYgLTCRnTZTlCcM6/dWhoUmtCZIXJW1oUsg6qcDkpAjknQrZAMCjborSLpORBkqLJSDYVgKclDCDllQT5eimTCZz+qxuyEdD7JZDyTyUs3sl6CRDU5YUnDzUYO4WMMW9VW6kOY+FcWqBZyH3QYUDuY3chVvw7eZRZYTrZO5h8kjhMbYy3UWDY+ypdg2n8sjzWsaM6qHc5d1JwxtjCr8IY78l1mYngDNQyHbG0jyOoXX9xPI+6g+iEHL+BlZxX+Edzd/wA0l1vdN6+ySGrG3PMGl4NiYWhS4i+YzE9Oazn06guxwezkNVGniHHa+67Ff2RcfRuPxgNnSD0WhwrGZPpeZ2Elc6yoYkj0C0+HVMhDyAehTfiwYaOzw/EXxJv6IyjxFjvqkFYH+alv0QfSFm1MS8yQR5IOfoVfs7+mQ67TPsrAxeds4y9h3C1sB2p/XccxqilgDOt7tOGITB8Qp1B4X+hRoYsAbInACcNTFgRMIsHRQsp5eqYt6pWYYwmBAUgwc05DeYWyYiXhRzjkrRlTSFglefkPulmKszBNnCBiABTZSpl4Th/JDBiosKgWHp8q8vUXOKDQUVGm7mq35hyVrnFUudrPyVK310PKKMPVD5vvcHZE93Oh+yGbTZfT0Se+N/hTltLsZrL6CO46hJBd8OSSO0h1Z5ZieG16TpEkDUi3wr8LimPs4eLebFehYvhgP/a57iHZ5rpMAHmDdUz9mRjuoAHwH0RGchuk9CgMTw6tSkh2cDbdU0+MR4XjznVFZYTSdjYEEQhHYgyIJUW4inUnKYPJU1ZZrcJprAtSmHse46mVLKOV1jf5BuhMFG4LiGm4V1RJyb+F4VVgPYSPVHM49Xw5DarczdiCgsL2gIGUEKjG4p1Qy70TNy0LrSZ2mD47SqAQ6Hct1psqgheVufF9DzFitHBdoKjLE5xyNip6v4G6PRcyiVy9Dtaz87XD5R+H7TUHGJIPWyGGY2AehU8w5H3VNKuxwkGVaHjklCRLunymLxy+VInom9EGYj3ig6oeimWzskGdEOw9FbaxVnen+hM4kbBKXcwtk2B8zknBx5pQ7mowea2TYIupn+lVuwxOw+VYQeZS7sncpGshTwVCkRy9lOOo9k5oKLaCGrQcofKP1fASU+6SRx+jZEWgqiphGFFEJd2nayDJi4jhzDssDiHAGOmW+u67V9AKqphmxoEuuA7Hk+N4M+mS5hnohGcQLTleI816fieGg7BYuL4G10ywH0Qz9jnGYjD0n30PRD/hnt+m4WvjuzLgSWGP9Oyyane0TDmmPcJ0/oUi18ayCjsLjiIBMhUsxLH/AFCOqWJwAa3Ox1kchaNkVWPHIlSGCOxXPUMSRE7I+lxO8SqRs3gnSS7NRmGcqn0zutCm0d1nz3jSVzON4qbhdGrXkjsn4Op4Lx7JUYwnwkwehXoTHAgELwbAV3OqNP8AqH3XuGA+hk65QuasKuiqXQWXKBekISsEjYUiElOHKeZqiXNWDgoFR3K/kkKz4025eXXzRGYJ8wWAD9445o6R73+FFz3zbTmR1HXqUUXqIf0WMClz+XwbfKfx312g7lEmomNRDBijO4bHbbffdOM+4j/odVb3h/oTySiYAy1P0n3P8pLQuksYYp3aJJImItTuSSQYClyBxOiSSmyiMzELmeO/SUkll5Azi2anzWkP/GU6So/IQIJ2JJK3H/YTk8Go36AsGvqUkl034OeQ/gn/AJGeYXtWE+hvkmSXDX9joXgvCTkkkA/JFqsCSSUIlIJJIgHCgUklmAQVjUkkQloTpJIoAkkkkTH/2Q==",
    "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRxb7AGW0VnXEZsfOm2mNXadLYxL6XkMcmBjXklGscvpkElpusHttS3giU_DTpb-89XYag&usqp=CAU",
    "https://i.kym-cdn.com/photos/images/original/001/875/618/2a8.png",
    "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRkuk29VCKfIefxoTsGPYT79r0jMwrXOUd_E26TgFDQEMndIBC2SpJ1aXuCTkMV8k9lVzE&usqp=CAU",
    "data:image/jpeg;base64,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",

  ],

  loadedImages: [],
  squareWidth: null,





  initialize: function() {

    this.canvas = document.getElementById("canvas"),
    this.canvas.width = window.innerWidth // THESE HAVE TO BE SET BEFORE GL IS MADE
    this.canvas.height = window.innerHeight
    document.getElementById("effectsCanvas").width = window.innerWidth
    document.getElementById("effectsCanvas").height = window.innerHeight
    this.aspect = canvas.width / canvas.height
    this.gl = this.canvas.getContext("webgl"),

    this.vertexShaderText = `
    precision mediump float;
  
    attribute vec4 vertPosition;
    attribute vec4 aVertColor;
    attribute float aPointSize;
    attribute vec3 aVertNormal;
    attribute vec2 aTexCoord;
  
    uniform mat4 pMatrix;
    uniform mat4 tMatrix;
    uniform mat4 nMatrix;
  
    varying lowp vec2 vTextureCoord;
    varying lowp vec3 vLighting;
  
    void main() {
      gl_Position = pMatrix * tMatrix * vertPosition;
      gl_PointSize = aPointSize;
  
      highp vec3 ambientLight = vec3(0.5, 0.5, 0.5);
      highp vec3 directionalLightColor = vec3(.8, .8, .8);
      highp vec3 directionalVector = normalize(vec3(0.0, 0.5, 1.0));
  
      highp vec4 transformedNormal = nMatrix * vec4(aVertNormal, 1.0);
  
      highp float directional = max(dot(transformedNormal.xyz, directionalVector), 0.0);
      highp vec3 lighting = ambientLight + (directionalLightColor * directional);
  
      vTextureCoord = aTexCoord;
      vLighting = lighting;
    }
    `
  
    this.fragmentShaderText = `
    precision mediump float;
  
    varying lowp vec2 vTextureCoord;
    varying lowp vec3 vLighting;

    uniform sampler2D uSampler;
  
    void main() {
      lowp vec4 texelColor = texture2D(uSampler, vTextureCoord);
      gl_FragColor = vec4(texelColor.rgb * vLighting, texelColor.a);
    }
    `
  
    // shaders //
    this.vertexShader = this.gl.createShader(this.gl.VERTEX_SHADER)
    this.fragmentShader = this.gl.createShader(this.gl.FRAGMENT_SHADER)
  
    // program //
    this.program = this.gl.createProgram()
  
    // buffers //
    this.pointsBuffer = this.gl.createBuffer()
    this.colorsBuffer = this.gl.createBuffer()
    this.normalsBuffer = this.gl.createBuffer()
    this.texCoordsBuffer = this.gl.createBuffer()
    this.polysBuffer = this.gl.createBuffer()
  
    this.linePointsBuffer = this.gl.createBuffer()
    this.linePointColorsBuffer = this.gl.createBuffer()
    this.linesBuffer = this.gl.createBuffer()
  
    this.dotPointsBuffer = this.gl.createBuffer()
    this.dotColorsBuffer = this.gl.createBuffer()
    this.dotsBuffer = this.gl.createBuffer()
    this.pointSizesBuffer = this.gl.createBuffer()






    this.gl.shaderSource(this.vertexShader, this.vertexShaderText)
    this.gl.shaderSource(this.fragmentShader, this.fragmentShaderText)

    this.gl.compileShader(this.vertexShader)
    this.gl.compileShader(this.fragmentShader)

    this.gl.attachShader(this.program, this.vertexShader)
    this.gl.attachShader(this.program, this.fragmentShader)
    this.gl.linkProgram(this.program)
    this.gl.validateProgram(this.program)

    // load textures //

    this.texture = this.gl.createTexture()
    this.gl.bindTexture(this.gl.TEXTURE_2D, this.texture)

    this.gl.texImage2D(this.gl.TEXTURE_2D, 0, this.gl.RGBA, 1, 1, 0, this.gl.RGBA, this.gl.UNSIGNED_BYTE, new Uint8Array([0, 0, 255, 255]))

    this.gl.pixelStorei(this.gl.UNPACK_FLIP_Y_WEBGL, true)

    //this.image.src = "https://i.kym-cdn.com/photos/images/original/001/875/618/2a8.png"
    //this.image.src = "data:image/jpeg;base64,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"
    

    this.squareWidth = Math.round(Math.sqrt(this.imageURLs.length) + .499999)
    
    for (let i = 0; i < this.imageURLs.length; i++) {
      let image = new Image()
      image.crossOrigin = "anonymous"
      image.onload = () => {
          this.loadedImages[i] = image
          if (this.loadedImages.length < this.imageURLs.length) return
          let loadedAll =  true
          for (let j = 0; j < this.loadedImages.length; j++) if (this.loadedImages[j] == null) loadedAll = false
          if (loadedAll) this.mergeImages(this.gl, this.loadedImages, this.texture)
      }
      image.src = this.imageURLs[i]
    }


    if (!this.gl.getProgramParameter(this.program, this.gl.LINK_STATUS)) console.log(`Unable to initialize the shader program: ${this.gl.getProgramInfoLog(this.program)}`)
  },

  mergeImages: (gl, loadedImages, texture) => {



    let canvas = document.createElement("canvas")
    canvas.width = webgl.squareWidth * 256
    canvas.height = webgl.squareWidth * 256
    //document.body.appendChild(canvas)
    let ctx = canvas.getContext("2d")

    for (let i = 0; i < loadedImages.length; i++) {
      if (loadedImages[i] != null) {
        let yLocation = parseInt(i / webgl.squareWidth, 10)
        let xLocation = i - yLocation * webgl.squareWidth

        ctx.drawImage(
          loadedImages[i], 
          0, 
          0, 
          loadedImages[i].width, 
          loadedImages[i].height, 
          xLocation * 256, yLocation * 256, 256, 256)
      }
      
    }
    let textures = new Image()
    textures.onload = () => {

      gl.bindTexture(gl.TEXTURE_2D, texture)
      gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, textures)

      if (textures.width & (textures.width - 1) === 0 && textures.height & (textures.height - 1) === 0) {
        console.log("using mipmap")
        gl.generateMipmap(gl.TEXTURE_2D)
      }
      else {
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE)
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE)
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR)
      }


    }
    textures.src = canvas.toDataURL()


  },



  renderFrame: function(playerPosition, angleX, angleY) {





  	let vSize = 3;

    this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.pointsBuffer);
    this.gl.bufferData(this.gl.ARRAY_BUFFER, new Float32Array(this.points), this.gl.DYNAMIC_DRAW);

    let posAttribLocation = this.gl.getAttribLocation(this.program, "vertPosition");
    this.gl.vertexAttribPointer(posAttribLocation, vSize, this.gl.FLOAT, false, vSize * Float32Array.BYTES_PER_ELEMENT, 0);
    this.gl.enableVertexAttribArray(posAttribLocation);


  	let nSize = 3;

    this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.normalsBuffer);
    this.gl.bufferData(this.gl.ARRAY_BUFFER, new Float32Array(this.pointNormals), this.gl.DYNAMIC_DRAW);

    let pointNormalAttribLocation = this.gl.getAttribLocation(this.program, "aVertNormal");
    this.gl.vertexAttribPointer(pointNormalAttribLocation, nSize, this.gl.FLOAT, false, nSize * Float32Array.BYTES_PER_ELEMENT, 0);
    this.gl.enableVertexAttribArray(pointNormalAttribLocation);


    let txSize = 2;
    
    this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.texCoordsBuffer);
    this.gl.bufferData(this.gl.ARRAY_BUFFER, new Float32Array(this.texCoords), this.gl.DYNAMIC_DRAW);

    let texCoordAttribLocation = this.gl.getAttribLocation(this.program, "aTexCoord");
    this.gl.vertexAttribPointer(texCoordAttribLocation, txSize, this.gl.FLOAT, false, txSize * Float32Array.BYTES_PER_ELEMENT, 0);
    this.gl.enableVertexAttribArray(texCoordAttribLocation);


  	let psSize = 1;

    this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.pointSizesBuffer);
    this.gl.bufferData(this.gl.ARRAY_BUFFER, new Float32Array(this.pointsizes), this.gl.DYNAMIC_DRAW);

    let pointSizeAttribLocation = this.gl.getAttribLocation(this.program, "aPointSize");
    this.gl.vertexAttribPointer(pointSizeAttribLocation, psSize, this.gl.FLOAT, false, psSize * Float32Array.BYTES_PER_ELEMENT, 0);
    this.gl.enableVertexAttribArray(pointSizeAttribLocation);






  	let pSize = 3;

    this.gl.bindBuffer(this.gl.ELEMENT_ARRAY_BUFFER, this.polysBuffer);
    this.gl.bufferData(this.gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(this.polys), this.gl.DYNAMIC_DRAW);

    this.gl.useProgram(this.program);


  	// ---------- // Matrices

    let tMatrix = mat4.create();

  	mat4.translate(tMatrix, tMatrix, [-2, -1, -8]);
    mat4.rotateX(tMatrix, tMatrix, angleX);
    mat4.rotateY(tMatrix, tMatrix, angleY);
    mat4.translate(tMatrix, tMatrix, [-playerPosition.x, -playerPosition.y, -playerPosition.z]);

    let tMatrixLocation = this.gl.getUniformLocation(this.program, "tMatrix");
    this.gl.uniformMatrix4fv(tMatrixLocation, false, tMatrix);

    let pMatrix = mat4.create();

    //                        fov        , aspect, near, far
    mat4.perspective(pMatrix, Math.PI / 3, this.aspect, .1, 1000);


    let pMatrixLocation = this.gl.getUniformLocation(this.program, "pMatrix");
    this.gl.uniformMatrix4fv(pMatrixLocation, false, pMatrix);



    let nMatrix = mat4.create();

    mat4.invert(nMatrix, tMatrix);
    mat4.transpose(nMatrix, nMatrix);

    let nMatrixLocation = this.gl.getUniformLocation(this.program, "nMatrix");
    this.gl.uniformMatrix4fv(nMatrixLocation, false, nMatrix);


    this.gl.clearColor(0.75, 0.8, 1, 1);
    this.gl.clearDepth(1);
    this.gl.enable(this.gl.DEPTH_TEST);
    this.gl.depthFunc(this.gl.LEQUAL);
    this.gl.clear(this.gl.COLOR_BUFFER_BIT | this.gl.DEPTH_BUFFER_BIT);

    this.gl.activeTexture(this.gl.TEXTURE0)
    this.gl.bindTexture(this.gl.TEXTURE_2D, this.texture)
    this.gl.uniform1i(this.gl.getUniformLocation(this.program, "uSampler"), 0)

    this.gl.drawElements(this.gl.TRIANGLES, this.polys.length, this.gl.UNSIGNED_SHORT, 0);


  	// ---------- // Lines

    this.gl.bindBuffer(this.gl.ELEMENT_ARRAY_BUFFER, this.linesBuffer);
    this.gl.bufferData(this.gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(this.lines), this.gl.DYNAMIC_DRAW);

    this.gl.drawElements(this.gl.LINES, this.lines.length, this.gl.UNSIGNED_SHORT, 0);

  	// ---------- // Dots

    this.gl.bindBuffer(this.gl.ELEMENT_ARRAY_BUFFER, this.dotsBuffer);
    this.gl.bufferData(this.gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(this.dots), this.gl.DYNAMIC_DRAW);

    this.gl.drawElements(this.gl.POINTS, this.dots.length, this.gl.UNSIGNED_SHORT, 0);








  }




}



var points = []
var pointColors = []
var pointNormals = []
var polys = []
var pointSizes = []
var dots = []
var lines = []





class Poly{
  static allPolys = []
  constructor(point1, point2, point3) {
    Poly.allPolys.push(this)
    this.point1 = point1;
    this.point2 = point2;
    this.point3 = point3;
    this.polyIndex = webgl.polys.length / 3;
    webgl.polys.push(point1.pointIndex, point2.pointIndex, point3.pointIndex);
    this.existant = true;
/*
    this.linePoint1 = new Point(this.point1.x, this.point1.y, this.point1.z, 0, 0, 0)
    this.linePoint2 = new Point(this.point2.x, this.point2.y, this.point2.z, 0, 0, 0)
    this.linePoint3 = new Point(this.point3.x, this.point3.y, this.point3.z, 0, 0, 0)
    this.line1 = new Line(this.linePoint1, this.linePoint2)
    this.line2 = new Line(this.linePoint2, this.linePoint3)
    this.line3 = new Line(this.linePoint3, this.linePoint1)
    */
  }

  delete() {
    webgl.polys.splice(this.polyIndex * 3, 3, null, null, null);
    this.existant = false;
  }

}


class Point {
  static allPoints = []
  constructor(x, y, z, n1, n2, n3, r, g, b, tx1, tx2) {
    Point.allPoints.push(this)
    this.x = x;
    this.y = y;
    this.z = z;

    this.n1 = n1;
    this.n2 = n2;
    this.n3 = n3;

    this.r = r;
    this.g = g;
    this.b = b;


    this.pointIndex = webgl.points.length / 3;
    this.pointSizeIndex = webgl.pointsizes.length;

    webgl.points.push(x, y, z);
    webgl.pointColors.push(this.r, this.g, this.b, 1)
    webgl.pointNormals.push(n1, n2, n3)
    webgl.texCoords.push(tx1, tx2)
    webgl.pointsizes.push(1.0);
  }

  setPosition(angle, x, y, z, scale) {
    webgl.points.splice(this.pointIndex * 3, 3, 	  this.x * scale  * Math.cos(angle) - this.z * scale  * Math.sin(angle) + x, this.y * scale + y, this.x * scale  * Math.sin(angle) + this.z * scale  * Math.cos(angle) + z);
    webgl.pointNormals.splice(this.pointIndex * 3, 3, this.n1 * Math.cos(angle) - this.n3 * Math.sin(angle)    , this.n2,    this.n1 * Math.sin(angle) + this.n3 * Math.cos(angle))
  }

  overridePosition(x, y, z) {

    this.x = x;
    this.y = y;
    this.z = z;

    webgl.points.splice(this.pointIndex * 3, 3, x, y, z)
  }

  overrideNormal(n1, n2, n3) {

    this.n1 = n1;
    this.n2 = n2;
    this.n3 = n3;

    webgl.pointNormals.splice(this.pointIndex * 3, 3, n1, n2, n3)
  }



  changeColor(r, g, b) {
    this.r = r;
    this.g = g;
    this.b = b;

    webgl.pointColors.splice(this.pointIndex * 4, 3, this.r, this.g, this.b);
  }


  delete() {
    webgl.points.splice(this.pointIndex * 3, 3, null, null, null)
    webgl.pointColors.splice(this.pointIndex * 4, 4, null, null, null, null)
    webgl.pointNormals.splice(this.pointIndex * 3, 3, null, null, null)
  }


}


class Line{
  constructor(point1, point2) {
    this.point1 = point1;
    this.point2 = point2;
    this.lineIndex = webgl.lines.length / 2;
    webgl.lines.push(point1.pointIndex, point2.pointIndex)

    this.existant = true;
  }

  delete() {
    webgl.lines.splice(this.lineIndex * 2, 2)
    this.existant = false;
  }
}


class Dot{
  constructor(point, size) {
    this.point = point;
    this.dotIndex = webgl.dots.length
    webgl.dots.push(point.pointIndex)

    this.pointSize = size;
    webgl.pointsizes.splice(point.pointSizeIndex, 1, size)
  }
}





class Model {
  constructor(geometryInfo, scale, r, g, b, texture) {
// 1 2 3

// 1 2 3   1
// 4 5 6   2
// 7 8 9   3

    let squareWidth = webgl.squareWidth

    let textureLocationY = (squareWidth - 1) - (parseInt(texture / webgl.squareWidth, 10))
    let textureLocationX = (texture - (parseInt(texture / webgl.squareWidth, 10)) * webgl.squareWidth)
    //textureLocationY = 2
    //textureLocationX = 1

    console.log(texture)

    console.log(textureLocationX + ", " + textureLocationY)
    

    this.scale = scale

    this.x = 0
    this.y = 0
    this.z = 0

    let positions = geometryInfo.positions
    let normals = geometryInfo.normals
    let texcoords = geometryInfo.texcoords
    let smooth = geometryInfo.smooth
    let indices = geometryInfo.indices

    this.positions = positions
    this.normals = normals
    this.smooth = smooth
    //smooth = true

    let vertexIndices = []
    let normalIndices = []
    for (let i = 0; i < geometryInfo.indices.length; i++) {
        vertexIndices.push(geometryInfo.indices[i].vertexes)
        normalIndices.push(geometryInfo.indices[i].normals)
    }

    this.vertexIndices = vertexIndices
    this.normalIndices = normalIndices

    this.points = []
    this.polys = []

    if (!smooth) {
      // for each triangle: make three new points and a poly

      for (let i = 0; i < vertexIndices.length; i++) if (!isNaN(indices[i].vertexes[0]) && !isNaN(indices[i].vertexes[1]) && !isNaN(indices[i].vertexes[2]) && !isNaN(indices[i].normals[0]) && !isNaN(indices[i].normals[1]) && !isNaN(indices[i].normals[2]) && !isNaN(indices[i].texcoords[0]) && !isNaN(indices[i].texcoords[1])) {
        let point1 = new Point(positions[indices[i].vertexes[0]][0] * scale + this.x, positions[indices[i].vertexes[0]][1] * scale + this.y, positions[indices[i].vertexes[0]][2] * scale + this.z, normals[indices[i].normals[0]][0], normals[indices[i].normals[0]][1], normals[indices[i].normals[0]][2], r, g, b, (texcoords[indices[i].texcoords[0]][0] + textureLocationX) / squareWidth, (texcoords[indices[i].texcoords[0]][1] + textureLocationY) / squareWidth)
        let point2 = new Point(positions[indices[i].vertexes[1]][0] * scale + this.x, positions[indices[i].vertexes[1]][1] * scale + this.y, positions[indices[i].vertexes[1]][2] * scale + this.z, normals[indices[i].normals[1]][0], normals[indices[i].normals[1]][1], normals[indices[i].normals[1]][2], r, g, b, (texcoords[indices[i].texcoords[1]][0] + textureLocationX) / squareWidth, (texcoords[indices[i].texcoords[1]][1] + textureLocationY) / squareWidth)
        let point3 = new Point(positions[indices[i].vertexes[2]][0] * scale + this.x, positions[indices[i].vertexes[2]][1] * scale + this.y, positions[indices[i].vertexes[2]][2] * scale + this.z, normals[indices[i].normals[2]][0], normals[indices[i].normals[2]][1], normals[indices[i].normals[2]][2], r, g, b, (texcoords[indices[i].texcoords[2]][0] + textureLocationX) / squareWidth, (texcoords[indices[i].texcoords[2]][1] + textureLocationY) / squareWidth)

        this.points.push(point1, point2, point3)
        this.polys.push(new Poly(point1, point2, point3))
      }

  }

  else {
      let points = []
      for (let i = 0; i < positions.length; i++) {
        let connectedPolys = []
        for (let j = 0; j < vertexIndices.length; j++) {
          for (let k = 0; k < vertexIndices[j].length; k++) {
            if (vertexIndices[j][k] == i) connectedPolys.push({ index: j, vertex: k })
          }
        }

        let averageNormalX = 0
        let averageNormalY = 0
        let averageNormalZ = 0

        for (let j = 0; j < connectedPolys.length; j++) {
          averageNormalX += normals[normalIndices[connectedPolys[j].index][connectedPolys[j].vertex]][0]
          averageNormalY += normals[normalIndices[connectedPolys[j].index][connectedPolys[j].vertex]][1]
          averageNormalZ += normals[normalIndices[connectedPolys[j].index][connectedPolys[j].vertex]][2]
        }
//heheheheheh goblin mdode
        averageNormalX /= connectedPolys.length
        averageNormalY /= connectedPolys.length
        averageNormalZ /= connectedPolys.length


        points.push(new Point(positions[i][0] * scale + this.x, positions[i][1] * scale + this.y, positions[i][2] * scale + this.z, averageNormalX, averageNormalY, averageNormalZ, r, g, b))
      }

      for (let i = 0; i < vertexIndices.length; i++) {
        this.polys.push(new Poly(points[vertexIndices[i][0]], points[vertexIndices[i][1]], points[vertexIndices[i][2]]))
      }

      this.points = points
    }


  }


  setPosition(angle, x, y, z) {
    for (let i = 0; i < this.points.length; i++) {
      this.points[i].setPosition(angle, x, y, z, this.scale)
    }
  }

  lerp(a, b, x) {
    return a + (b - a) * x
  }



  interpolatePoints(mesh1, mesh2, stage) {
    if (this.smooth) {
      if (mesh1.positions.length != mesh2.positions.length) {
        console.log(`meshes ${mesh1.name} and ${mesh2.name} have different numbers of points`)
        return
      }
      for (let i = 0; i < mesh1.positions.length; i++) {
        this.points[i].overridePosition(
          this.lerp(mesh1.positions[i][0] * this.scale, mesh2.positions[i][0] * this.scale, stage),
          this.lerp(mesh1.positions[i][1] * this.scale, mesh2.positions[i][1] * this.scale, stage),
          this.lerp(mesh1.positions[i][2] * this.scale, mesh2.positions[i][2] * this.scale, stage),
        )
      }
/*
      for (let i = 0; i < mesh1.normals.length; i++) {
        this.points[i].overrideNormal(
        this.lerp(mesh1.normals[i][0] * this.scale, mesh2.normals[i][0] * this.scale, stage),
        this.lerp(mesh1.normals[i][1] * this.scale, mesh2.normals[i][1] * this.scale, stage),
        this.lerp(mesh1.normals[i][2] * this.scale, mesh2.normals[i][2] * this.scale, stage),
        )
      }*/
    }
    else {
      if (mesh1.indices.length != mesh2.indices.length) {
        throw("different triangle count in" + mesh1.indices.length + ", " + mesh2.indices.length)
      }
      for (let i = 0; i < mesh1.indices.length; i++) {
        this.polys[i].point1.overridePosition(
          this.lerp(mesh1.positions[mesh1.indices[i].vertexes[0]][0] * this.scale, mesh2.positions[mesh2.indices[i].vertexes[0]][0] * this.scale, stage),
          this.lerp(mesh1.positions[mesh1.indices[i].vertexes[0]][1] * this.scale, mesh2.positions[mesh2.indices[i].vertexes[0]][1] * this.scale, stage),
          this.lerp(mesh1.positions[mesh1.indices[i].vertexes[0]][2] * this.scale, mesh2.positions[mesh2.indices[i].vertexes[0]][2] * this.scale, stage)
        )
        this.polys[i].point2.overridePosition(
          this.lerp(mesh1.positions[mesh1.indices[i].vertexes[1]][0] * this.scale, mesh2.positions[mesh2.indices[i].vertexes[1]][0] * this.scale, stage),
          this.lerp(mesh1.positions[mesh1.indices[i].vertexes[1]][1] * this.scale, mesh2.positions[mesh2.indices[i].vertexes[1]][1] * this.scale, stage),
          this.lerp(mesh1.positions[mesh1.indices[i].vertexes[1]][2] * this.scale, mesh2.positions[mesh2.indices[i].vertexes[1]][2] * this.scale, stage)
        )
        this.polys[i].point3.overridePosition(
          this.lerp(mesh1.positions[mesh1.indices[i].vertexes[2]][0] * this.scale, mesh2.positions[mesh2.indices[i].vertexes[2]][0] * this.scale, stage),
          this.lerp(mesh1.positions[mesh1.indices[i].vertexes[2]][1] * this.scale, mesh2.positions[mesh2.indices[i].vertexes[2]][1] * this.scale, stage),
          this.lerp(mesh1.positions[mesh1.indices[i].vertexes[2]][2] * this.scale, mesh2.positions[mesh2.indices[i].vertexes[2]][2] * this.scale, stage)
        )


        this.polys[i].point1.overrideNormal(
          this.lerp(mesh1.normals[mesh1.indices[i].normals[0]][0], mesh2.normals[mesh2.indices[i].normals[0]][0], stage),
          this.lerp(mesh1.normals[mesh1.indices[i].normals[0]][1], mesh2.normals[mesh2.indices[i].normals[0]][1], stage),
          this.lerp(mesh1.normals[mesh1.indices[i].normals[0]][2], mesh2.normals[mesh2.indices[i].normals[0]][2], stage)
        )
        this.polys[i].point2.overrideNormal(
          this.lerp(mesh1.normals[mesh1.indices[i].normals[1]][0], mesh2.normals[mesh2.indices[i].normals[1]][0], stage),
          this.lerp(mesh1.normals[mesh1.indices[i].normals[1]][1], mesh2.normals[mesh2.indices[i].normals[1]][1], stage),
          this.lerp(mesh1.normals[mesh1.indices[i].normals[1]][2], mesh2.normals[mesh2.indices[i].normals[1]][2], stage)
        )
        this.polys[i].point3.overrideNormal(
          this.lerp(mesh1.normals[mesh1.indices[i].normals[2]][0], mesh2.normals[mesh2.indices[i].normals[2]][0], stage),
          this.lerp(mesh1.normals[mesh1.indices[i].normals[2]][1], mesh2.normals[mesh2.indices[i].normals[2]][1], stage),
          this.lerp(mesh1.normals[mesh1.indices[i].normals[2]][2], mesh2.normals[mesh2.indices[i].normals[2]][2], stage)
        )
        

      }
    }
  }

  delete() {
    for (let i = 0; i < this.polys.length; i++) {
      this.polys[i].delete()
    }
    for (let i = 0; i < this.points.length; i++) {
      this.points[i].delete()
    }
  }

}



class Player {
  constructor(geometries, x, y, z, angleY, name) {
    this.geometries = geometries
    this.ingredientModels = {}
    for (let ingredient in geometries.idle) {
      let r = .5
      let g = .5
      let b = .5
      let scale = 1
      let texture = 0
      if (ingredient.indexOf("Slice") != -1) { r = .25; g = .15; b = .05; texture = 4; }
      if (ingredient.indexOf("cheese") != -1) { r = .6; g = .4; b = .1; texture = 3; }
      if (ingredient.indexOf("meat") != -1) { r = .6; g = .4; b = .4; texture = 3; }
      if (ingredient.indexOf("tomato") != -1) { r = .9; g = .2; b = .1; scale = 1.05; texture = 5; }
      this.ingredientModels[ingredient] = new Model(geometries.idle[ingredient], scale, r, g, b, texture)
    }


    this.animation = {
      startMeshName: "idle",
      endMeshName: "idle",
      currentMeshName: "idle",
      speed: 0,
      startTime: Date.now(),
      endTime: Date.now(),
      smooth: true,
      finished: true
    }

    this.position = {
      x: x,
      y: y,
      z: z
    }

    this.lastPosition = {
      x: x,
      y: y,
      z: z
    }

    this.angleY = angleY

    this.name = name
  }

  updatePosition() {
    for (let ingredient in this.ingredientModels) {
      this.ingredientModels[ingredient].setPosition(this.angleY, this.position.x, this.position.y, this.position.z)
    }
  }


  startAnimation(startMeshName, endMeshName, speed, smooth) {
    this.animation = {
      startMeshName: startMeshName,
      endMeshName: endMeshName,
      currentMeshName: endMeshName,
      speed: speed,
      startTime: Date.now(),
      endTime: Date.now() + speed * 1000,
      smooth: smooth,
      finished: false
    }

  }


  updateAnimation() {
    if (this.animation == null) return
    let stage
    if (!this.animation.smooth) stage = (Date.now() - this.animation.startTime) / (this.animation.endTime - this.animation.startTime)
    else stage = (Math.cos(Math.PI * ((Date.now() - this.animation.startTime) / (this.animation.endTime - this.animation.startTime) - 1)) + 1) / 2
    if (Date.now() >= this.animation.endTime) {
      this.animation.finished = true
      stage = 1
    }

    for (let ingredient in this.ingredientModels) {
      if (ingredient != "tomato4") this.ingredientModels[ingredient].interpolatePoints(this.geometries[this.animation.startMeshName][ingredient], this.geometries[this.animation.endMeshName][ingredient], stage)
    }
  }



}


class Weapon {
  constructor(geometryInfos, type) {

    // default settings
    this.cooldown = 1 // seconds
    this.automatic = false
    this.speed = .05 // units/millisecond
    this.manaCost = 20
    this.damage = 10 // this might be handled server
    this.chargeTime = 0 // seconds
    this.burstCount = 1
    this.burstInterval = .5 // time between shots of bursts, seconds
    this.scale = 1

    if (type == "tomato") {
      this.cooldown = .5
      this.manaCost = 5
      this.damage = 5

      this.scale = .625
      this.model = new Model(geometryInfos.tomato, this.scale, .6, .1, .1, 5)
    }
    
    if (type == "olive") {
      this.cooldown = .5
      this.manaCost = 5
      this.damage = 5

      this.scale = .925
      this.model = new Model(geometryInfos.olive, this.scale, .2, .3, .2, 2)
    }

    if (type == "pickle") {
      this.cooldown = .5
      this.manaCost = 5
      this.damage = 5

      this.scale = .625
      this.model = new Model(geometryInfos.pickle, this.scale, .1, .4, .1, 1)
    }

    if (type == "sausage") {
      this.cooldown = .5
      this.manaCost = 5
      this.damage = 5

      this.scale = .625
      this.model = new Model(geometryInfos.sausage, this.scale, .6, .1, .1, 3)
    }

    
    if (type == "anchovy") {
      this.cooldown = .5
      this.manaCost = 5
      this.damage = 5

      this.scale = 1
      this.model = new Model(geometryInfos.anchovy, this.scale, .6, .1, .1, 0)
    }


    if (type == "pan") {
      this.cooldown = .5
      this.manaCost = 5
      this.damage = 5

      this.scale = 1
      this.model = new Model(geometryInfos.pan, this.scale, .6, .1, .1, 0)
    }


    this.position = {
      x: 0,
      y: 0, 
      z: 0
    }
    this.angleY = 0


    this.shooted = false
    this.shootMovementVector = {
      x: 0,
      y: 0,
      z: 0      
    }

  }

  updatePosition(deltaTime) {
    if (this.shooted) {
      this.position.x += this.shootMovementVector.x * deltaTime
      this.position.y += this.shootMovementVector.y * deltaTime
      this.position.z += this.shootMovementVector.z * deltaTime
    }
    this.model.setPosition(this.angleY, this.position.x, this.position.y, this.position.z)
  }

  shoot(angleX, angleY) {
    angleX = -angleX + Math.PI / 64
    angleY = -angleY
    this.shootMovementVector.x = 0
    this.shootMovementVector.y = 0
    this.shootMovementVector.z = -this.speed

    let tempY = this.shootMovementVector.y
    let tempZ = this.shootMovementVector.z
    this.shootMovementVector.y = Math.cos(angleX) * tempY - Math.sin(angleX) * tempZ
    this.shootMovementVector.z = Math.sin(angleX) * tempY + Math.cos(angleX) * tempZ

    tempZ = this.shootMovementVector.z
    let tempX = this.shootMovementVector.x
    this.shootMovementVector.z = Math.cos(angleY) * tempZ - Math.sin(angleY) * tempX
    this.shootMovementVector.x = Math.sin(angleY) * tempZ + Math.cos(angleY) * tempX
/*
    this.position.z += -Math.sin(angleY)
    this.position.x += Math.cos(angleY)
    this.position.y += Math.cos(angleX)
    //this.position.z += Math.sin(angleX)
*/

    this.shooted = true

    return this.cooldown
  }



}



class Platform {
  constructor(geometryInfo, type, x, y, z) {
    console.log(geometryInfo[type])
    this.x = x
    this.y = y
    this.z = z

    if (type == "basic") {
      this.model = new Model(geometryInfo[type], 1, Math.random() / 2, Math.random() / 2, Math.random() / 2, 3)
      this.model.setPosition(0, this.x, this.y, this.z)
      this.width = 7
      this.height = 1.5
      this.length = 7
    }
    if (type == "crate") {
      this.model = new Model(geometryInfo[type], 1, .5, .1, .1, 3)
      this.model.setPosition(0, this.x, this.y + 1, this.z)
      this.width = 4
      this.height = 2
      this.length = 4

    }
    this.mx = this.x - this.width / 2
    this.px = this.x + this.width / 2
    this.my = this.y
    this.py = this.y + this.height
    this.mz = this.z - this.length / 2
    this.pz = this.z + this.length / 2
  }


  static calculateSlopes(lastPosition, currentPosition) {
    // calculate 6 slopes

    let x1 = lastPosition.x
    let x2 = currentPosition.x
    let y1 = lastPosition.y
    let y2 = currentPosition.y
    let z1 = lastPosition.z
    let z2 = currentPosition.z


    let functions = {
      x: {
        dependY: function(y){ return ((x2 - x1) / (y2 - y1) * y + ((x2 - x1) / (y2 - y1) * -y1) + x1) },
        dependZ: function(z){ return ((x2 - x1) / (z2 - z1) * z + ((x2 - x1) / (z2 - z1) * -z1) + x1) }
      },
      y: {
        dependZ: function(z){ return ((y2 - y1) / (z2 - z1) * z + ((y2 - y1) / (z2 - z1) * -z1) + y1) },
        dependX: function(x){ return ((y2 - y1) / (x2 - x1) * x + ((y2 - y1) / (x2 - x1) * -x1) + y1) }
      },
      z: {
        dependX: function(x){ return ((z2 - z1) / (x2 - x1) * x + ((z2 - z1) / (x2 - x1) * -x1) + z1) },
        dependY: function(y){ return ((z2 - z1) / (y2 - y1) * y + ((z2 - z1) / (y2 - y1) * -y1) + z1) }
      }
    }



    return functions
  }


  inRange(x, a, b) {
    if (a > b) return (a <= x <= b)
    else return (b <= x <= a)
  }

  calculateCollision(lastPosition, position, movement, gravity) {
    let correctedPosition = { x: position.x, y: position.y, z: position.z }
    let onPlatform = false

    // calculate if intersection is within bounds of face and that the point has passed the face in the dependent direction
    if (lastPosition.x <= this.mx && this.mx <= position.x) {


      // minus x face -- dependent is x, calculate for y and z dependent on x
      let yIntersect = movement.y.dependX(this.mx)
      let zIntersect = movement.z.dependX(this.mx)

      if (this.my <= yIntersect && yIntersect <= this.py && this.mz <= zIntersect && zIntersect <= this.pz) {
        correctedPosition.x = this.mx
      }
    }

    if (lastPosition.x >= this.px && this.px >= position.x) {


      // minus x face -- dependent is x, calculate for y and z dependent on x
      let yIntersect = movement.y.dependX(this.px)
      let zIntersect = movement.z.dependX(this.px)

      if (this.my <= yIntersect && yIntersect <= this.py && this.mz <= zIntersect && zIntersect <= this.pz) {
        correctedPosition.x = this.px
      }
    }

    if (lastPosition.z <= this.mz && this.mz <= position.z) {


      // minus x face -- dependent is x, calculate for y and z dependent on x
      let xIntersect = movement.x.dependZ(this.mz)
      let yIntersect = movement.y.dependZ(this.mz)

      if (this.mx <= xIntersect && xIntersect <= this.px && this.my <= yIntersect && yIntersect <= this.py) {
        correctedPosition.z = this.mz
      }
    }

    
    if (lastPosition.z >= this.pz && this.pz >= position.z) {


      // minus x face -- dependent is x, calculate for y and z dependent on x
      let xIntersect = movement.x.dependZ(this.pz)
      let yIntersect = movement.y.dependZ(this.pz)

      if (this.mx <= xIntersect && xIntersect <= this.px && this.my <= yIntersect && yIntersect <= this.py) {
        correctedPosition.z = this.pz
      }
    }

      
    if (lastPosition.y >= this.py && this.py >= position.y) {


      // minus x face -- dependent is x, calculate for y and z dependent on x
      let zIntersect = movement.z.dependY(this.py)
      let xIntersect = movement.x.dependY(this.py)

      if (this.mz <= zIntersect && zIntersect <= this.pz && this.mx <= xIntersect && xIntersect <= this.px) {
        correctedPosition.y = this.py
        onPlatform = true
        gravity = 0
      }

    }


    return {
      correctedPosition: correctedPosition,
      onPlatform: onPlatform,
      gravity: gravity
    }
  }


}






export default { webgl, Poly, Point, Line, Dot, Model, Player, Weapon, Platform }
