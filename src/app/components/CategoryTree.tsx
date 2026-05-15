"use client";

import { useState } from "react";
import Image from "next/image";
import { Category } from "@/interface/category";

// ─── Tree node type ───────────────────────────────────────────────────────────

interface TreeNode extends Category {
    children: TreeNode[];
}

// ─── Build tree from flat array ───────────────────────────────────────────────

function buildTree(flat: Category[]): TreeNode[] {
    const map = new Map<number, TreeNode>();
    const roots: TreeNode[] = [];

    flat.forEach(c => map.set(c.id, { ...c, children: [] }));

    map.forEach(node => {
        if (node.parentId !== null && map.has(node.parentId)) {
            map.get(node.parentId)!.children.push(node);
        } else {
            roots.push(node);
        }
    });

    return roots;
}

// ─── Props ────────────────────────────────────────────────────────────────────

export interface CategoryTreeProps {
    categories: Category[];
    onEdit?: (category: Category) => void;
    onDelete?: (category: Category) => void;
    onAddChild?: (parent: Category) => void;
    onToggleFeatured?: (category: Category) => void;
}

// ─── Root component ───────────────────────────────────────────────────────────

export default function CategoryTree({ categories, onEdit, onDelete, onAddChild, onToggleFeatured }: CategoryTreeProps) {
    const roots = buildTree(categories);

    if (roots.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center py-16 text-slate-400 dark:text-zinc-600">
                <span className="text-4xl mb-3">🗂</span>
                <p className="text-sm">Ангилал байхгүй байна</p>
            </div>
        );
    }

    return (
        <ul className="space-y-1">
            {roots.map(node => (
                <TreeNode
                    key={node.id}
                    node={node}
                    depth={0}
                    onEdit={onEdit}
                    onDelete={onDelete}
                    onAddChild={onAddChild}
                    onToggleFeatured={onToggleFeatured}
                />
            ))}
        </ul>
    );
}

// ─── Single tree node ─────────────────────────────────────────────────────────

interface TreeNodeProps {
    node: TreeNode;
    depth: number;
    onEdit?: (category: Category) => void;
    onDelete?: (category: Category) => void;
    onAddChild?: (parent: Category) => void;
    onToggleFeatured?: (category: Category) => void;
}

function TreeNode({ node, depth, onEdit, onDelete, onAddChild, onToggleFeatured }: TreeNodeProps) {
    const [open, setOpen] = useState(depth === 0);
    const hasChildren = node.children.length > 0;

    return (
        <li>
            <div
                className={`group flex items-center gap-2 px-3 py-2.5 rounded-xl transition-all
                    hover:bg-slate-100 dark:hover:bg-zinc-800/60
                    ${depth === 0 ? "bg-slate-50 dark:bg-zinc-800/30" : ""}`}
                style={{ paddingLeft: `${depth * 20 + 12}px` }}
            >
                {/* Expand toggle */}
                <button
                    type="button"
                    onClick={() => setOpen(o => !o)}
                    className={`w-5 h-5 flex items-center justify-center flex-shrink-0 transition-colors
                        ${hasChildren
                            ? "text-slate-400 dark:text-zinc-400 hover:text-slate-700 dark:hover:text-white"
                            : "text-transparent cursor-default"}`}
                >
                    {hasChildren && (
                        <svg
                            className={`w-3.5 h-3.5 transition-transform duration-200 ${open ? "rotate-90" : ""}`}
                            fill="none" stroke="currentColor" viewBox="0 0 24 24"
                        >
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M9 5l7 7-7 7" />
                        </svg>
                    )}
                </button>

                {/* Icon / image */}
                <span className="flex-shrink-0 w-16 h-16 rounded-lg overflow-hidden flex items-center justify-center">
                    {node.image ? (
                        <Image src={node.image} alt={node.name} width={24} height={24} className="object-cover w-full h-full" unoptimized />
                    ) : (
                        <span className="text-base leading-none">
                            {hasChildren ? (open ? "📂" : "📁") : "📄"}
                        </span>
                    )}
                </span>

                {/* Name */}
                <span className={`flex-1 px-4 font-semibold truncate text-sm
                    ${depth === 0
                        ? "text-slate-800 dark:text-white"
                        : "text-slate-600 dark:text-zinc-300"}`}>
                    {node.name}
                </span>

                {/* Product count badge */}
                <span className="text-[10px] font-bold text-slate-400 dark:text-zinc-500 bg-slate-100 dark:bg-zinc-800 px-2 py-0.5 rounded-full flex-shrink-0">
                    {node._count?.products ?? 0} бараа
                </span>

                {/* Featured badge */}
                {node.featured && (
                    <span className="text-[10px] font-bold text-amber-500 bg-amber-50 dark:bg-amber-500/10 px-2 py-0.5 rounded-full flex-shrink-0 border border-amber-200 dark:border-amber-500/20">
                        ★ онцлох
                    </span>
                )}

                {/* Actions — visible on hover */}
                <div className="flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0">
                    {onToggleFeatured && (
                        <ActionBtn
                            title={node.featured ? "Онцлохоос хасах" : "Онцлох болгох"}
                            onClick={() => onToggleFeatured(node)}
                            icon={
                                <svg className="w-3.5 h-3.5" fill={node.featured ? "currentColor" : "none"} stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
                                </svg>
                            }
                            color={node.featured
                                ? "text-amber-400 hover:bg-amber-500/10 dark:text-amber-400 dark:hover:bg-amber-500/20"
                                : "text-slate-300 hover:text-amber-400 hover:bg-amber-50 dark:text-zinc-600 dark:hover:text-amber-400 dark:hover:bg-amber-500/10"}
                        />
                    )}
                    {onAddChild && (
                        <ActionBtn
                            title="Дэд ангилал нэмэх"
                            onClick={() => onAddChild(node)}
                            icon={
                                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 4v16m8-8H4" />
                                </svg>
                            }
                            color="text-teal-500 hover:bg-teal-500/10 dark:text-teal-400 dark:hover:bg-teal-500/20"
                        />
                    )}
                    {onEdit && (
                        <ActionBtn
                            title="Засах"
                            onClick={() => onEdit(node)}
                            icon={
                                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                </svg>
                            }
                            color="text-slate-400 hover:bg-slate-200 dark:text-zinc-400 dark:hover:bg-zinc-700"
                        />
                    )}
                    {onDelete && (
                        <ActionBtn
                            title="Устгах"
                            onClick={() => onDelete(node)}
                            icon={
                                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                </svg>
                            }
                            color="text-slate-300 hover:text-red-500 hover:bg-red-50 dark:text-zinc-600 dark:hover:text-red-400 dark:hover:bg-red-500/10"
                        />
                    )}
                </div>
            </div>

            {/* Children */}
            {hasChildren && open && (
                <ul className="mt-0.5 space-y-0.5 border-l border-slate-200 dark:border-zinc-800 ml-6">
                    {node.children.map(child => (
                        <TreeNode
                            key={child.id}
                            node={child}
                            depth={depth + 1}
                            onEdit={onEdit}
                            onDelete={onDelete}
                            onAddChild={onAddChild}
                            onToggleFeatured={onToggleFeatured}
                        />
                    ))}
                </ul>
            )}
        </li>
    );
}

// ─── Small action button ──────────────────────────────────────────────────────

function ActionBtn({ icon, title, onClick, color }: {
    icon: React.ReactNode;
    title: string;
    onClick: () => void;
    color: string;
}) {
    return (
        <button
            type="button"
            title={title}
            onClick={e => { e.stopPropagation(); onClick(); }}
            className={`w-6 h-6 rounded-lg flex items-center justify-center transition-colors ${color}`}
        >
            {icon}
        </button>
    );
}
