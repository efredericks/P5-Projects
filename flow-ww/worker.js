onmessage = e => {
    const message = e.data;
    //   console.log(e.data);

    if (message == "CLOSE")
        close();
    else {
        // e.data[0] += e.data[2];
        // e.data[1] += e.data[3];

        // if (e.data[0] < 0 || e.data[0] > e.data[4])
        //   e.data[0] = (e.data[4]/2);//random(e.data[5]);
        // if (e.data[1] < 0 || e.data[1] > e.data[5])
        //   e.data[1] = (e.data[5]/2);//random(e.data[6]);
        for (let i = 0; i < e.data.length; i++) {
            e.data[i].position.x += e.data[i].velocity.x;
            e.data[i].position.y += e.data[i].velocity.y;

            if (e.data[i].position.x < 0 || e.data[i].position.x > e.data[i].width)
                e.data[i].position.x = e.data[i].width / 2;
            if (e.data[i].position.y < 0 || e.data[i].position.y > e.data[i].height)
                e.data[i].position.y = e.data[i].height / 2;
        }

        const reply = setTimeout(() => postMessage(e.data), 100);
    }
};