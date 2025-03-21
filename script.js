console.log('hello');
let songs;
let currFolder;
function secondsToMinutesSeconds(input) {
    if (isNaN(input) || input < 0) {
        return "00:00";
    }
    let min = Math.floor(input / 60);
    let sec = Math.floor(input % 60);

    // Pad the minutes and seconds to have leading zeros if necessary
    let newmin = String(min).padStart(2, '0');
    let newsec = String(sec).padStart(2, '0');

    return `${newmin}:${newsec}`;
}

let currentSong = new Audio();

async function getSongs(folder) {
    currFolder = folder
    let a = await fetch(`http://127.0.0.1:3000/${folder}/`)
    let response = await a.text()
    let div = document.createElement("div")
    div.innerHTML = response
    let as = div.getElementsByTagName("a")
    songs = []
    for (let index = 0; index < as.length; index++) {
        const element = as[index];
        if (element.href.endsWith(".mp3") || element.href.endsWith(".m4a")) {
            songs.push(element.href.split(`/${folder}/`)[1])
        }
    }

    let songOL = document.querySelector(".songlist").getElementsByTagName("ol")[0]
    songOL.innerHTML = ""
    for (const song of songs) {
        songOL.innerHTML = songOL.innerHTML + `<li>
                            <img src="Images/music.svg" width="25px" alt="">
                            <div class="info">
                                <div>${song.replaceAll("%20", " ")}</div>
                                <div>Legend</div>
                            </div>
                            <div class="playnow">
                                <span>Play Now</span>
                                <img src="Images/play.svg" width="20px" alt="">
                            </div>
                        </li>`
    }

    //Attach an event listener to each song
    Array.from(document.querySelector(".songlist").getElementsByTagName("li")).forEach(e => {
        e.addEventListener("click", element => {
            console.log(e.querySelector(".info").firstElementChild.innerHTML);
            playMusic(e.querySelector(".info").firstElementChild.innerHTML);
        })

    })
    return songs

}

const playMusic = (track, pause = false) => {
    // let audio = new Audio("/Songs/" + track)
    currentSong.src = `/${currFolder}/` + track
    if (!pause) {
        currentSong.play()
        play.src = "Images/pause.svg"
    }
    document.querySelector(".songinfo").innerHTML = decodeURI(track)
    document.querySelector(".songtime").innerHTML = "00:00 / 00:00"

}

async function displayAlbums() {
    let a = await fetch(`http://127.0.0.1:3000/Songs/`)
    let response = await a.text()
    let div = document.createElement("div")
    div.innerHTML = response
    let anchors = div.getElementsByTagName("a")
    let cardContainer = document.querySelector(".cardContainer")
    let array = Array.from(anchors)
    for (let index = 0; index < array.length; index++) {
        const e = array[index];

        if (e.href.includes("/Songs")) {
            let folder = (e.href.split("/")[4]);
            //Get the metadata of the folder
            let a = await fetch(`http://127.0.0.1:3000/Songs/${folder}/info.json`)
            let response = await a.json();
            cardContainer.innerHTML = cardContainer.innerHTML + `<div data-folder="${folder}" class="card">
                        <div class="ballon">
                        <div class="play">
                            <svg width="50" height="50" xmlns="http://www.w3.org/2000/svg">
                                <circle cx="25" cy="25" r="22" stroke="#1fdf64" stroke-width="3" fill="#1fdf64" />
                                <polygon points="18,15 35,25 18,35" fill="black" />
                            </svg>
                        </div>
                            <img src="/Songs/${folder}/Cover.jpg" alt="">
                        </div>
                        <h3>${response.title}</h3>
                        <p>${response.description}</p>
                    </div>`
        }
    }


    // loading the playlist whenever card is clicked
    Array.from(document.getElementsByClassName("card")).forEach(e => {
        e.addEventListener("click", async item => {
            songs = await getSongs(`Songs/${item.currentTarget.dataset.folder}`)
            playMusic(songs[0])
            document.querySelector(".playbar").style.opacity = 1;
        })
    })

}
async function main() {

    await getSongs("Songs/fun")
    playMusic(songs[0], true)


    //Display all the albums on the page
    displayAlbums()

    //Attach an event listener to play and pause
    play.addEventListener("click", () => {
        if (currentSong.paused) {
            currentSong.play()
            play.src = "Images/pause.svg"
        } else {
            currentSong.pause()
            play.src = "Images/play.svg"
        }
    })

    // Listen for timeupdate event
    currentSong.addEventListener("timeupdate", () => {
        // console.log(currentSong.currentTime, currentSong.duration);
        document.querySelector(".songtime").innerHTML = `${secondsToMinutesSeconds(currentSong.currentTime)} / ${secondsToMinutesSeconds(currentSong.duration)}`

        //moving circle
        document.querySelector(".circle").style.left = (currentSong.currentTime / currentSong.duration) * 99 + "%"
    })

    //Add event listener to seekbar
    const seekbar = document.querySelector(".seekbar");
    const circle = document.querySelector(".circle");

    let isDragging = false;

    // When the user clicks and holds the circle
    circle.addEventListener("mousedown", () => {
        isDragging = true;
    });

    // When the user moves the mouse

    document.addEventListener("mousemove", (e) => {
        if (isDragging) {
            const seekbarRect = seekbar.getBoundingClientRect();
            let offsetX = e.clientX - seekbarRect.left;

            // Clamp the position so the circle stays within the seekbar
            if (offsetX < 0) offsetX = 0;
            if (offsetX > seekbarRect.width) offsetX = seekbarRect.width;

            // Move the circle and update the current time
            circle.style.left = (offsetX / seekbarRect.width) * 99 + "%";
            currentSong.currentTime = currentSong.duration * (offsetX / seekbarRect.width);
        }
    });

    // When the user releases the mouse button
    document.addEventListener("mouseup", () => {
        isDragging = false;
    });
    document.querySelector(".seekbar").addEventListener("click", e => {
        document.querySelector(".circle").style.left = (e.offsetX / e.target.getBoundingClientRect().width) * 99 + "%"
        currentSong.currentTime = currentSong.duration * (e.offsetX / e.target.getBoundingClientRect().width)
    })
    // var audio = new Audio(songs[0])
    // // audio.play()

    // audio.addEventListener("loadeddata", ()=> {
    //     let duration = audio.duration
    //     console.log(audio.duration , audio.currentSrc, audio.currentTime);
    // })  

    document.querySelector(".nav > img").addEventListener("click", () => {
        document.querySelector(".left").style.left = "0"
    })

    document.querySelector(".logo :last-child").addEventListener("click", () => {
        document.querySelector(".left").style.left = "-100%"
    })

    let rigthWidth = document.querySelector(".right").getBoundingClientRect().width;
    let containerWidth = document.querySelector(".container").getBoundingClientRect().width;
    let rPercent = (document.querySelector(".right").getBoundingClientRect().width / document.querySelector(".container").getBoundingClientRect().width) * 100;

    document.querySelector(".playbar").style.width = (rPercent - 2) + "%"
    document.querySelector(".playbar").style.marginLeft = ((rigthWidth / 100) * 1.2) + "px"

    //prev and next
    prev.addEventListener("click", () => {
        console.log('prev');
        let index = songs.indexOf(currentSong.src.split("/").slice(-1)[0])
        if ((index - 1) >= 0) {
            playMusic(songs[index - 1])
        }

    })
    next.addEventListener("click", () => {
        console.log('next');
        let index = songs.indexOf(currentSong.src.split("/").slice(-1)[0])
        console.log(index);

        // if((index+1) == songs.length-1){
        //     playMusic(songs[0],true)
        // }
        if ((index + 1) <= songs.length - 1) {
            playMusic(songs[index + 1])
        }
    })

    //volume button
    document.querySelector(".range").getElementsByTagName("input")[0].addEventListener("change", (e) => {
        currentSong.volume = parseInt(e.target.value) / 100
    })

    document.querySelector(".vol img").addEventListener("click", (e) => {
        // console.log(e.target.src.split("Images/")[1]);
        // console.log(currentSong.volume*100);

        if (e.target.src.includes("volume.svg")) {
            e.target.src = e.target.src.replace("volume.svg", "mute.svg")
            currentSong.volume = 0
            document.querySelector(".range").getElementsByTagName("input")[0].value = 0
        } else {
            e.target.src = e.target.src.replace("mute.svg", "volume.svg")
            currentSong.volume = 1
            document.querySelector(".range").getElementsByTagName("input")[0].value = 50
        }
    })

}
main()


