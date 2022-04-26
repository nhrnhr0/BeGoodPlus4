<script>
    export let doc_stock_list;
</script>


<main>
<table class="enter-documents-table">
    <thead>
        <tr>
            <th>id</th>
            <th>תיאור</th>
            <th>מספר חשבונית</th>
            <th>ספק</th>
            <th>נוצר ב</th>
            <th>כניסה למחסן</th>
            <th>האם מוכל</th>
            <th>עריכה</th>
        </tr>
    </thead>
    <tbody>
        {#each doc_stock_list as doc}
            <tr>
                <td>{doc.id}</td>
                <td>{doc.description}</td>
                <td>{doc.docNumber}</td>
                <td>{doc.provider_name}</td>
                <td>{doc.created_at}</td>
                <td>{doc.warehouse_name}</td>
                <td>{doc.isAplied}</td>
                <td>
                    <a href="/inv/doc-stock-enter/{doc.id}" class="edit-document-link" data-id="{doc.id}">עריכה</a>
                </td>
            </tr>
        {/each}
    </tbody>
</table>
</main>
<style lang="scss">
    main {
        width: 70%;
        padding-top: 100px;
        margin: 0 auto;
        .enter-documents-table {
            width: 100%;
            border-collapse: collapse;
        }
        .enter-documents-table th,
        .enter-documents-table td {
            border: 1px solid #ddd;
            padding: 8px;
            text-align: center;
        }
        .enter-documents-table tr:nth-child(even) {
            background-color: #f2f2f2;
        }
        .enter-documents-table th {
            padding-top: 12px;
            padding-bottom: 12px;
            background-color: #4CAF50;
            color: white;
        }
    }
</style>