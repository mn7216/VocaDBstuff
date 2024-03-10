import re
import requests

class NiconicoPlaylistIE:
    _VALID_URL = r'https?://(?:(?:www\.|sp\.)?nicovideo\.jp|nico\.ms)/(?:user/\d+/)?(?:my/)?mylist/?(?:#/)?(?P<id>\d+)'
    
    _API_HEADERS = {
        'X-Frontend-ID': '6',
        'X-Frontend-Version': '0',
        'X-Niconico-Language': 'en-us'
    }
    
    def _call_api(self, list_id, query):
        return requests.get(
            f'https://nvapi.nicovideo.jp/v2/mylists/{list_id}',
            params=query,
            headers=self._API_HEADERS).json()['data']['mylist']
    
    def _extract_playlist_entries(self, list_id, page):
        query = {
            'page': page,
            'pageSize': 100,
        }
        playlist_data = self._call_api(list_id, query)
        for item in playlist_data['items']:
            video_id = item['watchId']
            if video_id:
                yield f"     'https://www.nicovideo.jp/watch/{video_id}',"
    
    def extract_playlist(self, url):
        match = re.match(self._VALID_URL, url)
        if match:
            list_id = match.group('id')
            entries = []
            for page in range(1, 101):  # Assumes the playlist has at most 10000 videos
                page_entries = list(self._extract_playlist_entries(list_id, page))
                entries.extend(page_entries)
                if len(page_entries) < 100:
                    break
            
            # Output video links to text file
            text_filename = f'{list_id}.txt'
            with open(text_filename, 'w', encoding='utf-8') as txtfile:
                txtfile.write('\n'.join(entries))
            
            print(f'Playlist extracted and saved to {text_filename}')
        else:
            print('Invalid playlist URL')

# Example usage
url = 'https://www.nicovideo.jp/user/648156/mylist/5024496'
extractor = NiconicoPlaylistIE()
extractor.extract_playlist(url)