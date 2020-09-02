import requests
from bs4 import BeautifulSoup
from profanity import profanity
from langdetect import detect_langs
from langdetect import detect

base_url = "http://api.genius.com"
access_token = "Kour0xvL9idf21Cl8IKOPg3emxL3hcv0jf35noI_VrsE1OAhEWLHfN0ejPfeo860"
headers = {'Authorization': 'Bearer ' + access_token}

song_title = "Traplanta"
artist_name = "Lil Keed"

def lyrics_from_song_url(page_url):
    page = requests.get(page_url)
    html = BeautifulSoup(page.text, "html.parser")
    #remove script tags that they put in the middle of the lyrics
    [h.extract() for h in html('script')]
    #at least Genius is nice and has a tag called 'lyrics'!
    lyrics = html.find("div", class_="lyrics").get_text()
    return lyrics

def getPageURLs():
    top_charts_url = "https://genius.com/#top-songs"
    page = requests.get(top_charts_url)
    html = BeautifulSoup(page.text, "html.parser")
    links = html.body.find_all('a', {"class":"PageGriddesktop-a6v82w-0 ChartItemdesktop__Row-sc-3bmioe-0 qsIlk"}, href=True)
    return links

if __name__ == "__main__":
    songLinks = getPageURLs()
    passageFile = open('passages.txt', 'w')
    passages = []
    i = 0;
    for song in songLinks:
        lyrics = lyrics_from_song_url(song['href'])
        j = 0;
        passage = ""
        for line in lyrics.split('\n'):
            if j == 4:
                passage = profanity.censor(passage)
                passage += "\n"
                #write to file
                passageFile.write(passage)
                passage = ""
                j = 0
            if line and line[0] != "[":
                langs = detect_langs(line)
                if (len(langs) == 1 and langs[0].lang == "en"):
                    if j == 0:
                        passage += line
                    else:
                        passage = passage + ". " + line
                    j += 1
    passageFile.close()
