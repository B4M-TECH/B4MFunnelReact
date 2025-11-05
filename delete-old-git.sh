# --- CONFIG ---
REMOTE=${REMOTE:-origin}
BRANCH=${BRANCH:-main}

# 0) Vérifie le remote
git remote get-url "$REMOTE" || { echo "Remote $REMOTE introuvable"; exit 1; }

# 1) Crée une nouvelle branche orpheline avec un commit VIDE (zéro fichier)
git switch --orphan __purge__
# Ne stage rien : on veut un commit sans fichiers
git reset --hard
git commit --allow-empty -m "purge: reset repository to empty state (no files)"
# Remplace la branche principale par celle-ci
git branch -M "__purge__" "$BRANCH"

# 2) Force-push ce commit vide sur la branche par défaut
git push --force-with-lease --set-upstream "$REMOTE" "$BRANCH"

# 3) Supprime TOUTES les branches distantes sauf la branche par défaut
git for-each-ref --format='%(refname:short)' "refs/remotes/$REMOTE" \
| sed -E "s#^$REMOTE/##" \
| grep -Ev "^(HEAD|$BRANCH)$" \
| xargs -r -n1 -I % git push "$REMOTE" --delete %

# 4) Supprime TOUS les tags distants
git tag -l | xargs -r -n1 -I % git push "$REMOTE" :refs/tags/%

# 5) Nettoyage local (optionnel)
git fetch "$REMOTE" --prune
git remote prune "$REMOTE"
git reflog expire --expire=now --all
git gc --prune=now --aggressive

echo "✅ Distant vidé : 1 commit vide sur $BRANCH, plus aucune autre branche/tag."

echo "# $(basename "$(git rev-parse --show-toplevel)")" > README.md
git add README.md
git commit -m "docs: fresh README"