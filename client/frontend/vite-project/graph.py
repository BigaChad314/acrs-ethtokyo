import networkx as nx
import matplotlib.pyplot as plt

# 그래프 생성
G = nx.Graph()

# 노드 추가
nodes = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12]
G.add_nodes_from(nodes)

# 엣지 추가 (사용자가 제공한 그래프 구조에 따라 추가)
edges = [
    (1, 5), (1, 6), (1, 4), 
    (2, 4), (2, 3), 
    (3, 10), (3, 9), (3, 7),
    (4, 6), 
    (6, 9), 
    (7, 9), (7, 10),
    (8, 9), 
    (9, 10), (9, 11), (9, 12),
    (10, 13), (11, 12)
]
G.add_edges_from(edges)

# 노드 4 강조 설정
node_sizes = [700 if node == 4 else 300 for node in G.nodes()]
node_colors = ['lightblue' if node == 4 else 'lightgrey' for node in G.nodes()]
edge_colors = ['black' if 4 in edge else 'grey' for edge in G.edges()]

# 그래프 레이아웃 설정
pos = nx.spring_layout(G, seed=42)

# 그래프 그리기
plt.figure(figsize=(10, 8))
nx.draw_networkx_nodes(G, pos, node_size=node_sizes, node_color=node_colors, edgecolors='black')
nx.draw_networkx_edges(G, pos, edge_color=edge_colors, width=2)
nx.draw_networkx_labels(G, pos, font_size=12, font_color='black')

plt.title("Graph Highlighting Node 4 as a Key Connector", fontsize=16)
plt.axis('off')
plt.show()
