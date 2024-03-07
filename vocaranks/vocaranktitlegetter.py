import requests
from bs4 import BeautifulSoup
import re
import json
import csv

video_urls = [
    'https://www.nicovideo.jp/watch/sm1612998', 
    'https://www.nicovideo.jp/watch/sm1729084', 
    'https://www.nicovideo.jp/watch/sm1729209', 
    'https://www.nicovideo.jp/watch/sm1762494', 
    'https://www.nicovideo.jp/watch/sm1770292', 
    'https://www.nicovideo.jp/watch/sm1833971',
    'https://www.nicovideo.jp/watch/sm1834216', 
    'https://www.nicovideo.jp/watch/sm1883012', 
    'https://www.nicovideo.jp/watch/sm1883310', 
    'https://www.nicovideo.jp/watch/sm1997225', 
    'https://www.nicovideo.jp/watch/sm1999088', 
    'https://www.nicovideo.jp/watch/sm2090520',
    'https://www.nicovideo.jp/watch/sm2091811', 
    'https://www.nicovideo.jp/watch/sm2153944', 
    'https://www.nicovideo.jp/watch/sm2154380', 
    'https://www.nicovideo.jp/watch/sm2154810', 
    'https://www.nicovideo.jp/watch/sm2154810', 
    'https://www.nicovideo.jp/watch/sm2373499',
    'https://www.nicovideo.jp/watch/sm2379839', 
    'https://www.nicovideo.jp/watch/sm2692344', 
    'https://www.nicovideo.jp/watch/sm2692674', 
    'https://www.nicovideo.jp/watch/sm2695940', 
    'https://www.nicovideo.jp/watch/sm2929487', 
    'https://www.nicovideo.jp/watch/sm2914127',
    'https://www.nicovideo.jp/watch/sm3033436', 
    'https://www.nicovideo.jp/watch/sm3033613', 
    'https://www.nicovideo.jp/watch/sm3033727', 
    'https://www.nicovideo.jp/watch/sm3214814', 
    'https://www.nicovideo.jp/watch/sm3216054', 
    'https://www.nicovideo.jp/watch/sm1833971',
    'https://www.nicovideo.jp/watch/sm3218066', 
    'https://www.nicovideo.jp/watch/sm3218676', 
    'https://www.nicovideo.jp/watch/sm4053125', 
    'https://www.nicovideo.jp/watch/sm4053795', 
    'https://www.nicovideo.jp/watch/sm4054429', 
    'https://www.nicovideo.jp/watch/sm4279997',
    'https://www.nicovideo.jp/watch/sm4283532', 
    'https://www.nicovideo.jp/watch/sm4283767', 
    'https://www.nicovideo.jp/watch/sm5295272', 
    'https://www.nicovideo.jp/watch/sm5297317', 
    'https://www.nicovideo.jp/watch/sm5297716', 
    'https://www.nicovideo.jp/watch/sm6478546',
    'https://www.nicovideo.jp/watch/sm6479346', 
    'https://www.nicovideo.jp/watch/sm2692344', 
    'https://www.nicovideo.jp/watch/sm2692674', 
    'https://www.nicovideo.jp/watch/sm2695940', 
    'https://www.nicovideo.jp/watch/sm2929487', 
    'https://www.nicovideo.jp/watch/sm2914127'
] # This is the NPC playlist (https://www.nicovideo.jp/mylist/3678045). Should function with any vocaranks that have LINKED songs in their descs.

def extract_links_from_description(description_data):
    pattern = re.compile(r'https://www.nicovideo.jp/watch/(sm\d+|nm\d+)')
    return pattern.findall(description_data)

def get_video_title_and_availability(url):
    print(f"Fetching title from: {url}")
    response = requests.get(url)
    soup = BeautifulSoup(response.text, 'html.parser')
    title_tag = soup.find('title')
    original_title = title_tag.text.strip() if title_tag else 'Title not found'

    if original_title == 'ニコニコ動画': #If the song is deleted, the title element will return "ニコニコ動画", so this tells it to defer to nicolog in that case
        nicolog_url = url.replace('nicovideo', 'nicolog')
        print(f"Attempting title fetch from Nicolog: {nicolog_url}")
        nicolog_response = requests.get(nicolog_url)
        nicolog_soup = BeautifulSoup(nicolog_response.text, 'html.parser')
        nicolog_title_tag = nicolog_soup.find('meta', {'property': 'og:title'})
        if nicolog_title_tag:
            nicolog_title = nicolog_title_tag.get('content', '').replace('ニコログ｜', '').strip()
            if nicolog_title:
                title = nicolog_title
                available = "Unavailable"
            else:
                title = 'Title not found from Nicolog'
                available = "Unavailable"
        else:
            title = 'Nicolog fetch failed'
            available = "Unavailable"
    else:
        title = original_title.replace(' - ニコニコ動画', '').strip()
        available = "Available"

    print(f"Title: {title}, Available: {available}")
    return title, available

videos_info = []

for url in video_urls:
    response = requests.get(url)
    soup = BeautifulSoup(response.text, 'html.parser')
    json_data_div = soup.find('div', {'id': 'js-initial-watch-data'})
    main_video_id = url.split('/')[-1]

    if json_data_div:
        json_data_str = json_data_div.get('data-api-data')
        if json_data_str:
            json_data = json.loads(json_data_str)
            main_video_title = json_data.get('video', {}).get('title', '')
            description = json_data.get('video', {}).get('description', '')
            video_ids = extract_links_from_description(description)

            video_group_info = [('Video ID', 'Title', 'Availability')]
            video_group_info.append((main_video_id, main_video_title, 'Main Video'))

            for video_id in video_ids:
                video_title, available = get_video_title_and_availability(f'https://www.nicovideo.jp/watch/{video_id}')
                video_group_info.append((video_id, video_title, available))

            videos_info.append(video_group_info)
        else:
            print('No JSON data found in the HTML.')
    else:
        print('No JSON data container found.')

csv_filename = 'video_info.csv'
with open(csv_filename, 'w', newline='', encoding='utf-8-sig') as file: #make sure to save as utf-8-sig since excel does NOT like regular utf 8 with japanese characters
    writer = csv.writer(file)
    for video_group in videos_info:
        writer.writerow([])
        writer.writerow([video_group[1][1], '', ''])
        writer.writerows(video_group)

print(f"CSV file has been created: {csv_filename}")