group: music dataset
description[[
Este dataset contém informações básicas sobre usuários, playlists, músicas, artistas e álbuns.

* A relação _usuario_ contém dados dos usuários do sistema.
* A relação _album_ contém informações sobre os álbuns disponíveis.
* A relação _artista_ contém informações dos artistas.
* A relação _musica_ contém as músicas, com referência a álbuns e artistas.
* A relação _playlist_ contém playlists criadas pelos usuários.
* A relação _playlist_musica_ contém as músicas dentro das playlists.
* A relação _player_plataforma_ representa a execução de músicas por usuários.
]]

usuario = { cd_usuario nome_usuario senha_usuario email_usuario
1 Miguel senha123 miguelexample.com
2 Bob rocknroll bobexample.com
3 Charlie stonesfan charlieexample.com
4 Tom queen4ever tomexample.com
5 Yhasmin zeppelin123 yhasexample.com
}

album = { cd_album nm_album genero
1 AbbeyRoad rock
2 LedZeppelinIV NULL
3 TheDarkSideoftheMoon NULL
4 ANightAtTheOpera NULL
5 StickyFingers NULL
0 AlbumDesconhecido NULL
}

artista = { cd_artista nm_artista
1 The_Beatles
2 Led_Zeppelin
3 Pink_Floyd
4 Queen
5 The_Rolling_Stones
0 Artista_Desconhecido
}

musica = { cd_musica nome_musica cd_album cd_artista
1 Come_Together 1 1
2 Something 1 1
3 Stairway_To_Heaven 2 2
4 Black_Dog 2 2
5 Time 3 3
6 Money 3 3
7 Bohemian_Rhapsody 4 4
8 Love_Of_My_Life 4 4
9 Brown_Sugar 5 5
10 Wild_Horses 5 5
13 teste2 2 2
}

playlist = { cd_playlist cd_usuario data_criacao
1 1 2025-06-18
2 3 2025-06-20
3 4 2025-06-20
4 5 2025-06-20
5 2 2025-06-20
}

playlist_musica = { cd_playlist cd_musica ordem id
5 2 0 18
4 2 0 19
}

player_plataforma = { cd_player cd_musica cd_usuario
1 3 2
}
