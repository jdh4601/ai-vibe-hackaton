import { useEffect, useMemo } from 'react';
import { Color, MeshStandardMaterial, type Texture } from 'three';
import type { JacketSpec } from '../game/types';

// The three mask channels isolate jacket wool/hair, sleeve leather, and denim/skin.
// Recolour in the fragment shader so every department shares the same two GPU textures.
export function useStudentMaterials(
  map: Texture, dyeMap: Texture, jacket: JacketSpec, skin: string, hair: string, pants: string, bald: boolean,
) {
  const { bodyColor, sleeveColor } = jacket;
  const materials = useMemo(() => {
    function dyed(primary: string, secondary: string, third: string, head: boolean, denim: boolean) {
      const material = new MeshStandardMaterial({ map, roughness: 0.86 });
      material.onBeforeCompile = (shader) => {
        Object.assign(shader.uniforms, {
          scalpOffset: { value: head && bald ? 0.5 : 0 },
          dyeMask: { value: dyeMap },
          primaryDye: { value: new Color(primary) },
          secondaryDye: { value: new Color(secondary) },
          thirdDye: { value: new Color(third) },
          hairRegion: { value: Number(head) },
          denimRegion: { value: Number(denim) },
        });
        shader.vertexShader = shader.vertexShader.replace('#include <uv_pars_vertex>', '#include <uv_pars_vertex>\nuniform float scalpOffset;')
          .replace('#include <uv_vertex>', '#include <uv_vertex>\nvMapUv.x += scalpOffset;');
        shader.fragmentShader = shader.fragmentShader.replace('#include <map_pars_fragment>', `
          #include <map_pars_fragment>
          uniform sampler2D dyeMask;
          uniform vec3 primaryDye, secondaryDye, thirdDye;
          uniform float hairRegion, denimRegion;
        `).replace('#include <map_fragment>', `
          #include <map_fragment>
          vec3 dye = texture2D(dyeMask, vMapUv).rgb;
          vec3 original = diffuseColor.rgb;
          // The blue wool, pale denim and skin each have different reference albedos.
          float primaryLight = mix(original.b / 0.36, original.r / 0.032, hairRegion);
          diffuseColor.rgb = mix(original, primaryDye * primaryLight, dye.r);
          diffuseColor.rgb = mix(diffuseColor.rgb, secondaryDye * original, dye.g);
          vec3 thirdLight = mix(original / vec3(0.84, 0.60, 0.42), vec3(original.b / 0.51), denimRegion);
          diffuseColor.rgb = mix(diffuseColor.rgb, thirdDye * thirdLight, dye.b);
        `);
      };
      return material;
    }
    return {
      jacket: dyed(bodyColor, sleeveColor, skin, false, false),
      head: dyed(hair, sleeveColor, skin, true, false),
      denim: dyed(bodyColor, sleeveColor, pants, false, true),
    };
  }, [map, dyeMap, bodyColor, sleeveColor, skin, hair, pants, bald]);
  useEffect(() => () => Object.values(materials).forEach((m) => m.dispose()), [materials]);
  return materials;
}
