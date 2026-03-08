import { useState, useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity } from 'react-native';

interface SeletorPaginasVisualProps {
  totalPaginas: number;
  paginasSelecionadas: number[];
  onChange: (paginas: number[], pageRangeString: string) => void;
}

function numerosParaRange(nums: number[]): string {
  if (nums.length === 0) return '';
  const sorted = [...nums].sort((a, b) => a - b);
  const groups: string[] = [];
  let start = sorted[0];
  let end = sorted[0];

  for (let i = 1; i <= sorted.length; i++) {
    if (i < sorted.length && sorted[i] === end + 1) {
      end = sorted[i];
    } else {
      groups.push(start === end ? `${start}` : `${start}-${end}`);
      if (i < sorted.length) {
        start = sorted[i];
        end = sorted[i];
      }
    }
  }
  return groups.join(', ');
}

export function SeletorPaginasVisual({ totalPaginas, paginasSelecionadas, onChange }: SeletorPaginasVisualProps) {
  const [selecionadas, setSelecionadas] = useState<Set<number>>(new Set(paginasSelecionadas));

  useEffect(() => {
    setSelecionadas(new Set(paginasSelecionadas));
  }, [paginasSelecionadas]);

  function togglePagina(n: number) {
    const novo = new Set(selecionadas);
    if (novo.has(n)) {
      novo.delete(n);
    } else {
      novo.add(n);
    }
    setSelecionadas(novo);
    const arr = Array.from(novo).sort((a, b) => a - b);
    onChange(arr, numerosParaRange(arr));
  }

  function selecionarTodas() {
    const todas = new Set(Array.from({ length: totalPaginas }, (_, i) => i + 1));
    setSelecionadas(todas);
    const arr = Array.from(todas);
    onChange(arr, numerosParaRange(arr));
  }

  function limparSelecao() {
    setSelecionadas(new Set());
    onChange([], '');
  }

  const arr = Array.from(selecionadas).sort((a, b) => a - b);

  return (
    <View style={{ marginTop: 8 }}>
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
        <Text style={{ fontSize: 13, color: '#374151', fontWeight: '600' }}>
          Toque nas páginas que deseja imprimir:
        </Text>
        <View style={{ flexDirection: 'row' }}>
          <TouchableOpacity onPress={selecionarTodas} style={{ marginRight: 8 }}>
            <Text style={{ fontSize: 11, color: '#10B981', fontWeight: 'bold' }}>Todas</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={limparSelecao}>
            <Text style={{ fontSize: 11, color: '#EF4444', fontWeight: 'bold' }}>Limpar</Text>
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: 8 }}>
        <View style={{ flexDirection: 'row', gap: 6, paddingVertical: 4, paddingHorizontal: 2 }}>
          {Array.from({ length: totalPaginas }, (_, i) => {
            const num = i + 1;
            const sel = selecionadas.has(num);
            return (
              <TouchableOpacity
                key={num}
                onPress={() => togglePagina(num)}
                style={{
                  width: 40,
                  height: 52,
                  borderRadius: 6,
                  backgroundColor: sel ? '#10B981' : '#F3F4F6',
                  borderWidth: 1.5,
                  borderColor: sel ? '#059669' : '#D1D5DB',
                  justifyContent: 'center',
                  alignItems: 'center',
                }}
              >
                <Text style={{ fontSize: 14, fontWeight: 'bold', color: sel ? '#fff' : '#6B7280' }}>{num}</Text>
                {sel && <View style={{ width: 6, height: 6, borderRadius: 3, backgroundColor: '#fff', marginTop: 2 }} />}
              </TouchableOpacity>
            );
          })}
        </View>
      </ScrollView>

      {arr.length > 0 ? (
        <View style={{ backgroundColor: '#ECFDF5', padding: 8, borderRadius: 8, borderLeftWidth: 3, borderLeftColor: '#10B981' }}>
          <Text style={{ fontSize: 12, color: '#065F46', fontWeight: '600' }}>
            ✓ {arr.length} página(s) selecionada(s): {numerosParaRange(arr)}
          </Text>
        </View>
      ) : (
        <View style={{ backgroundColor: '#FEF3C7', padding: 8, borderRadius: 8, borderLeftWidth: 3, borderLeftColor: '#F59E0B' }}>
          <Text style={{ fontSize: 12, color: '#92400E' }}>
            Nenhuma página selecionada — serão impressas todas as páginas
          </Text>
        </View>
      )}
    </View>
  );
}
