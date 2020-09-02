import requests
import boto3
from bs4 import BeautifulSoup
from profanity import profanity
from langdetect import detect_langs
from langdetect import detect
from botocore.client import Config

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
    title = html.find("h1", class_="header_with_cover_art-primary_info-title").get_text()
    artist = html.find("a", class_="header_with_cover_art-primary_info-primary_artist").get_text()
    return lyrics, title, artist

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
    profanity.set_censor_characters("*")
    for song in songLinks:
        lyrics, title, artist = lyrics_from_song_url(song['href'])
        j = 0;
        passage = ""
        for line in lyrics.split('\n'):
            if j == 4:
                passage = profanity.censor(passage)
                passage += "\n"
                #write to file
                passageFile.write(passage)
                passageFile.write(title + "\n" + artist + "\n")
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

    ACCESS_KEY_ID = 'AKIA224QDIV7CNGJFEI4'
    ACCESS_SECRET_KEY = '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'
    BUCKET_NAME = 'typerunnerpassages'

    data = open('passages.txt', 'rb')

    s3 = boto3.resource(
        's3',
        aws_access_key_id=ACCESS_KEY_ID,
        aws_secret_access_key=ACCESS_SECRET_KEY,
        config=Config(signature_version='s3v4')
    )
    s3.Bucket(BUCKET_NAME).put_object(Key='passages.txt', Body=data)
