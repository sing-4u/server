import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class SpotifyService {
  private clientId: string;
  private clientSecret: string;
  private accessToken: string | null;
  constructor(private configService: ConfigService) {
    const clientId = this.configService.get('SPOTIFY_CLIENT_ID');
    const clientSecret = this.configService.get('SPOTIFY_CLIENT_SECRET');

    if (!clientId || !clientSecret) {
      throw new Error('Spotify client key and secret are required');
    }

    this.clientId = clientId;
    this.clientSecret = clientSecret;
    this.accessToken = null;
  }

  async getAccessToken() {
    const response = await fetch('https://accounts.spotify.com/api/token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        Authorization: `Basic ${btoa(`${this.clientId}:${this.clientSecret}`)}`,
      },
      body: 'grant_type=client_credentials',
    });

    try {
      const data = await response.json();
      this.accessToken = data.access_token;
    } catch (e) {
      console.error('Error fetching access token', e);
      console.dir(response, { depth: null });
      throw e;
    }
  }

  async search(
    query: string,
    repeat?: number,
  ): Promise<{ artist: string; title: string; image: string }[]> {
    try {
      if (!this.accessToken) {
        await this.getAccessToken();
      }
      const response = await fetch(
        `https://api.spotify.com/v1/search?q=${query}&type=track&limit=5`,
        {
          headers: {
            Authorization: `Bearer ${this.accessToken}`,
          },
        },
      );

      if (response.status === 401) {
        if (repeat === 1) {
          console.error('Spotify error');
          return [];
        }
        await this.getAccessToken();
        return this.search(query, 1);
      }

      const data = await response.json();

      const tracks = data.tracks.items as {
        name: string;
        album: {
          images: { url: string }[];
        };
        artists: { name: string }[];
      }[];

      return tracks.map((track) => ({
        artist: track.artists[0].name,
        title: track.name,
        image: track.album.images[0].url,
      }));
    } catch (e) {
      console.error('Error fetching search results', e);
      return [];
    }
  }
}
